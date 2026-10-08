"""完整 child 与 Goal/Todo 链路，只替换模型 provider 边界。"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

import httpx
import pytest
from iris.goal.models import GoalSnapshot
from iris.message import (
    LLMRequest,
    LLMResponse,
    ModelResponseCompleted,
    ModelResponseStarted,
    ModelStreamEvent,
    ModelStreamScope,
    TextBlock,
    ToolUseBlock,
)
from iris.providers import CompletionProvider, ModelRoute
from iris.streaming import LiveEnvelope, LiveSubscriptionRequest
from test_host_boundaries import applied
from test_host_core import config_text

from iris_studio.app import create_app
from iris_studio.contracts import SSE_PAYLOADS, StreamReady
from iris_studio.resources import StudioHost
from iris_studio.streaming import subscribe


class ScriptedProvider:
    """按真实模型请求序列选择输出，runtime/store/tool 仍全部执行。"""

    def __init__(self, responses: list[LLMResponse]) -> None:
        self.responses = responses
        self.requests: list[LLMRequest] = []

    def estimate_input_tokens(self, request: LLMRequest) -> int:
        """本测试不重新实现 token 预算。"""
        return 10

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """提供下一份模型响应。"""
        self.requests.append(request)
        return self.responses.pop(0)

    async def stream(self, request: LLMRequest) -> AsyncIterator[ModelStreamEvent]:
        """遵循真实 SDK 采用的 typed streaming 协议。"""
        response = await self.complete(request)
        scope = ModelStreamScope(
            model_stream_id=f"{request.model}-{len(self.requests)}",
            provider="controlled",
            model=request.model,
            attempt=1,
        )
        yield ModelResponseStarted(
            scope=scope,
            sequence=1,
            occurred_at=datetime.now(UTC),
            response_id=f"response-{len(self.requests)}",
        )
        yield ModelResponseCompleted(
            scope=scope,
            sequence=2,
            occurred_at=datetime.now(UTC),
            response=response,
            semantic_output_emitted=False,
        )


def text_response(text: str) -> LLMResponse:
    """构造实际交给 SDK 的文字模型响应。"""
    return LLMResponse(
        provider="controlled",
        model="controlled",
        content=[TextBlock(text=text)],
        finish_reason="stop",
    )


@pytest.mark.asyncio
async def test_child_tree_first_fact_terminal_and_gap_durable_recovery(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """短 child 首包到终态保留 lineage；断线后分 parent/child 补读实际序列。"""
    parent = ScriptedProvider(
        [
            LLMResponse(
                provider="controlled",
                model="parent",
                content=[
                    ToolUseBlock(id="delegate", name="subagent", input={"prompt": "独立子任务材料"})
                ],
                finish_reason="tool_calls",
            ),
            text_response("父任务完成"),
        ]
    )
    child = ScriptedProvider([text_response("子任务真实完成")])

    def child_provider(
        model: str | ModelRoute,
        *,
        api_style: Literal["responses", "chat_completions"] = "responses",
        api_key: str | None = None,
        base_url: str | None = None,
        timeout: float | None = None,
        headers: dict[str, str] | None = None,
    ) -> CompletionProvider:
        """只替换 child provider 工厂边界，不触碰委派或持久化。"""
        return child

    monkeypatch.setattr("iris.runtime._assembly.create_provider_client", child_provider)
    (tmp_path / "subagents.yaml").write_text(
        "default: researcher\nagents:\n  researcher:\n    path: child.yaml\n    description: Read independent material\n",
        encoding="utf-8",
    )
    (tmp_path / "child.yaml").write_text(
        "name: researcher\nmodel: openai/child\nsystem: Child instructions\nsession:\n  backend: sqlite\n  path: never-created.db\n",
        encoding="utf-8",
    )
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: parent)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(
            host,
            client,
            tmp_path / "agent.yaml",
            config_text(tmp_path) + "tools:\n  subagent: subagents.yaml\n",
        )
        generation = host.generation(view.generation_id)
        binding = generation.binding
        host.register_session(generation, "parent-session", "父会话")
        subscription = binding.broker.subscribe(
            LiveSubscriptionRequest(scope="session_tree", scope_id="parent-session")
        )
        base = f"/api/stores/{view.store_binding_id}"
        accepted = await client.post(
            base + "/sessions/parent-session/inputs", json={"input": "父会话输入"}
        )
        assert accepted.status_code == 202, accepted.text
        parent_id = accepted.json()["receipt"]["run_id"]
        seen: list[LiveEnvelope] = []
        async with asyncio.timeout(15):
            while True:
                item = await anext(subscription)
                assert isinstance(item, LiveEnvelope)
                SSE_PAYLOADS[item.kind].model_validate(item.payload)
                seen.append(item)
                if item.kind == "run.terminal" and item.run_id == parent_id:
                    break
        await subscription.aclose()
        assert binding.store.load_result(parent_id).error is None
        child_page = (await client.get(base + f"/runs/{parent_id}/children")).json()
        assert len(child_page["items"]) == 1
        summary = child_page["items"][0]
        child_id = summary["run"]["run_id"]
        child_session = summary["run"]["session_id"]
        assert child_id != parent_id and child_session != "parent-session"
        assert summary["agent_selector"] == "researcher"
        child_facts = [item for item in seen if item.run_id == child_id]
        assert child_facts[0].kind == "subagent.linked"
        assert all(
            item.scope_id == "parent-session"
            and item.lineage.child_run_id == child_id
            and item.lineage.root_run_id == parent_id
            for item in child_facts
        )
        assert child_facts[-1].kind == "run.terminal"
        assert all(item.session_id == child_session for item in child_facts)
        assert not (tmp_path / "never-created.db").exists()
        ready = StreamReady(
            connection_id="reconnect",
            backend_epoch=host.backend_epoch,
            store_binding_id=view.store_binding_id,
            source_id=binding.source_id,
            resource_id=None,
            stream_epoch=binding.broker.current_epoch(),
            scope="session_tree",
            scope_id="parent-session",
        )
        import json

        frames = subscribe(
            host,
            binding.broker,
            ready,
            json.dumps(
                {
                    "stream_epoch": "previous-process",
                    "scope": "session_tree",
                    "scope_id": "parent-session",
                    "after_live_sequence": 0,
                }
            ),
        )
        assert b"stream.ready" in await anext(frames)
        assert b"replay.gap" in await anext(frames)
        await frames.aclose()
        restored_sequences: dict[str, list[int]] = {}
        for run_id in (parent_id, child_id):
            sequence = 0
            events = []
            while True:
                response = await client.get(
                    base + f"/runs/{run_id}/events", params={"after_sequence": sequence, "limit": 2}
                )
                assert response.status_code == 200, response.text
                page = response.json()
                events.extend(page["events"])
                if page["next_cursor"] is None:
                    break
                sequence = page["next_cursor"]["after_sequence"]
            assert all(event["run_id"] == run_id for event in events)
            restored_sequences[run_id] = [event["sequence"] for event in events]
            assert restored_sequences[run_id] == list(
                range(1, binding.store.load_run(run_id).last_event_sequence + 1)
            )
        parent_messages = (await client.get(base + "/sessions/parent-session/messages")).json()[
            "items"
        ]
        assert [
            part["text"]
            for message in parent_messages
            if message["role"] == "assistant"
            for part in message["parts"]
            if part["type"] == "text"
        ] == ["父任务完成"]
        child_messages = (await client.get(base + f"/sessions/{child_session}/messages")).json()[
            "items"
        ]
        assert child_messages[-1]["parts"][0]["text"] == "子任务真实完成"


class GoalProvider(ScriptedProvider):
    """第一轮普通结束，第二轮用真实 goal revision 申报完成。"""

    def __init__(
        self, goal_reader: Callable[[], GoalSnapshot | None], *, block_first: bool = False
    ) -> None:
        super().__init__([])
        self.goal_reader = goal_reader
        self.reported = False
        self.started = asyncio.Event()
        self.release = asyncio.Event()
        if not block_first:
            self.release.set()

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """模型输入、Run 轮次与报告结算均交真实领域执行。"""
        self.requests.append(request)
        if len(self.requests) == 1:
            self.started.set()
            await self.release.wait()
        goal = self.goal_reader()
        assert goal is not None
        if goal.rounds_started == 2 and not self.reported:
            self.reported = True
            return LLMResponse(
                provider="controlled",
                model="goal",
                content=[
                    ToolUseBlock(
                        id="goal-report",
                        name="report_goal",
                        input={
                            "goal_id": goal.goal_id,
                            "revision": goal.revision,
                            "decision": "complete",
                            "reason": "两轮真实工作已核对",
                        },
                    )
                ],
                finish_reason="tool_calls",
            )
        return text_response("已完成本轮工作")


@pytest.mark.asyncio
async def test_http_goal_automatically_runs_two_rounds_and_settles_report(tmp_path: Path) -> None:
    """HTTP 创建目标后自动推进两轮，完成来自持久报告结算。"""
    provider = GoalProvider(
        lambda: host.binding(view.store_binding_id).store.get_current_goal("goal")
    )
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(
            host,
            client,
            tmp_path / "agent.yaml",
            config_text(tmp_path) + "goal:\n  enabled: true\n",
        )
        generation = host.generation(view.generation_id)
        host.register_session(generation, "goal", "自动目标")
        base = f"/api/stores/{view.store_binding_id}/sessions/goal"
        created = await client.post(
            base + "/goal/create", json={"objective": "两轮目标任务", "max_rounds": 2}
        )
        assert created.status_code == 200, created.text
        async with asyncio.timeout(15):
            while True:
                goal_view = (await client.get(base + "/goal")).json()["data"]
                if goal_view["goal"]["status"] == "completed" and not goal_view["armed"]:
                    break
                await asyncio.sleep(0.01)
        assert goal_view["goal"]["rounds_started"] == 2
        assert not goal_view["settlement_pending"]
        store = generation.binding.store
        runs = (await client.get(base + "/runs")).json()["items"]
        assert len(runs) == 2
        bindings = [store.get_goal_run(run["run_id"]) for run in runs]
        assert [binding.round_no for binding in bindings] == [1, 2]
        assert all(binding.settled_at is not None for binding in bindings)
        assert bindings[1].applied_report_call_id == "goal-report"
        assert store.list_unsettled_goal_runs("goal") == ()
        report = store.load_tool_call(runs[1]["run_id"], "goal-report")
        assert report.result.data["goal_report"]["decision"] == "complete"
        assert len(provider.requests) == 3
        assert all(
            any("两轮目标任务" in message.text for message in request.messages)
            for request in provider.requests
        )


@pytest.mark.asyncio
async def test_goal_pause_keeps_current_run_and_todo_completion_does_not_settle_goal(
    tmp_path: Path,
) -> None:
    """清单文件、当前 Run 与目标后续轮次是三个独立事实。"""
    provider = GoalProvider(
        lambda: host.binding(view.store_binding_id).store.get_current_goal("goal"), block_first=True
    )
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(
            host,
            client,
            tmp_path / "agent.yaml",
            config_text(tmp_path) + "goal:\n  enabled: true\ntodo:\n  enabled: true\n",
        )
        generation = host.generation(view.generation_id)
        host.register_session(generation, "goal", "目标与清单")
        base = f"/api/stores/{view.store_binding_id}/sessions/goal"
        initial = (await client.get(base + "/todo/document")).json()["data"]
        pending = "# 当前清单\n- [ ] 核对文件\n"
        saved = await client.put(
            base + "/todo", json={"base_text": initial["text"], "text": pending}
        )
        assert saved.status_code == 200, saved.text
        created = await client.post(
            base + "/goal/create", json={"objective": "目标需要独立验收", "max_rounds": 2}
        )
        assert created.status_code == 200, created.text
        await asyncio.wait_for(provider.started.wait(), 10)
        completed = await client.put(
            base + "/todo",
            json={"base_text": pending, "text": "# 当前清单\n- [x] 核对文件\n"},
        )
        assert completed.status_code == 200, completed.text
        assert (await client.get(base + "/todo")).json()["data"]["items"][0][
            "status"
        ] == "completed"
        before = (await client.get(base + "/goal")).json()["data"]
        assert before["goal"]["status"] == "active"
        run_id = before["run"]["run_id"]
        paused = await client.post(base + "/goal/pause", json={"reason": "暂停后继轮次"})
        assert paused.status_code == 200, paused.text
        assert paused.json()["result"]["view"]["goal"]["status"] == "paused"
        assert not paused.json()["result"]["view"]["armed"]
        assert generation.binding.store.load_run(run_id).cancellation_requested_at is None
        provider.release.set()
        async with asyncio.timeout(10):
            while (
                generation.binding.store.load_result(run_id) is None
                or generation.binding.store.get_goal_run(run_id).settled_at is None
            ):
                await asyncio.sleep(0.01)
        assert generation.binding.store.load_result(run_id).run.stop_reason.value == "completed"
        current = (await client.get(base + "/goal")).json()["data"]
        assert current["goal"]["status"] == "paused" and current["goal"]["rounds_started"] == 1
        resumed = await client.post(base + "/goal/resume", json={})
        assert resumed.status_code == 200, resumed.text
        async with asyncio.timeout(10):
            while (await client.get(base + "/goal")).json()["data"]["goal"][
                "status"
            ] != "completed":
                await asyncio.sleep(0.01)
        assert len(provider.requests) == 4
        assert (
            Path(completed.json()["path"]).read_text(encoding="utf-8")
            == "# 当前清单\n- [x] 核对文件\n"
        )
