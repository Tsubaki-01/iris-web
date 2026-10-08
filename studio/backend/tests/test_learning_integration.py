"""通过真实 Studio host、Iris coordinator 与持久服务验证学习链路。"""

from __future__ import annotations

import asyncio
import json
import sqlite3
from collections.abc import Callable
from pathlib import Path
from typing import Any, Literal

import httpx
import pytest
import yaml
from iris.lifecycle import AgentRunRequest
from iris.message import LLMRequest, LLMResponse, TextBlock
from test_host_boundaries import applied
from test_host_core import Provider, settle

from iris_studio.app import create_app
from iris_studio.contracts import GenerationView
from iris_studio.resources import StudioHost

LearningKind = Literal["memory", "evolution"]


class LearningProvider(Provider):
    """仅替换模型边界，聊天、捕获、调度和发布均运行真实实现。"""

    def __init__(self, kind: LearningKind) -> None:
        super().__init__()
        self.kind = kind
        self.learning_requests: list[LLMRequest] = []
        self.revise_prompt = False
        self.count_records = False

    def estimate_input_tokens(self, request: LLMRequest) -> int:
        """需要验证批次预算时按记录计量，其余请求采用固定预算。"""
        if self.count_records and request.response_format == "json_object":
            return len(json.loads(request.messages[-1].text).get("records", [])) or 1
        return 1

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """为真实 JSON 协议返回确定性结果。"""
        self.learning_requests.append(request)
        output = (
            {"observations": []}
            if self.kind == "memory"
            else {
                "body": f"# 项目经验\n\n第 {len(self.learning_requests)} 次整理：使用 uv。",
                "reason": "保留本批真实项目约定",
            }
        )
        if self.revise_prompt:
            output = {
                "action": "prompt",
                "target": "compaction",
                "body": "保留项目约定。",
                "reason": "精简",
            }
        return LLMResponse(
            provider="test",
            model="test",
            content=[TextBlock(text=json.dumps(output, ensure_ascii=False))],
            finish_reason="stop",
            input_tokens=20,
            output_tokens=5,
            total_tokens=25,
        )


def learning_config(
    workspace: Path, kind: LearningKind, *, idle: float = 3600, threshold: int = 10
) -> str:
    """生成最小学习配置，保留真实 SQLite 与工作区路径。"""
    return yaml.safe_dump(
        {
            "name": "learning-integration",
            "model": "openai/test",
            "system": "帮助维护本地项目。",
            "permissions": {"workspace": str(workspace)},
            "session": {"backend": "sqlite", "path": "runs.db"},
            "maintenance": {"idle_seconds": idle, "min_pending_runs": threshold},
            "memory": {"enabled": kind == "memory", "generation": {"enabled": kind == "memory"}},
            "evolution": {"enabled": kind == "evolution"},
            "skills": {"enabled": kind == "evolution"},
        }
    )


async def until(predicate: Callable[[], bool]) -> None:
    """等待可观察状态，避免依赖固定机器执行速度。"""
    async with asyncio.timeout(10):
        while not predicate():
            await asyncio.sleep(0.01)


async def operation(client: httpx.AsyncClient, response: httpx.Response) -> dict[str, Any]:
    """通过公开 operation 入口等待本次请求自己的结果。"""
    assert response.status_code == 202, response.text
    async with asyncio.timeout(10):
        while True:
            current = await client.get(response.json()["location"])
            assert current.status_code == 200, current.text
            result = current.json()
            if result["state"] in {"succeeded", "failed"}:
                return result
            await asyncio.sleep(0.01)


def resource_url(view: GenerationView) -> str:
    """取得本次配置唯一启用的真实资源身份。"""
    assert len(view.resource_refs) == 1
    return f"/api/resources/{view.resource_refs[0].resource_id}"


@pytest.mark.parametrize("kind", ["memory", "evolution"])
async def test_automatic_learning_requires_idle_and_enough_new_runs(
    tmp_path: Path, kind: LearningKind
) -> None:
    """空闲后一个新 Run 仍等待材料，第二个终态 Run 才放行真实模型。"""
    provider = LearningProvider(kind)
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
            learning_config(tmp_path, kind, idle=0.15, threshold=2),
        )
        generation = host.generation(view.generation_id)
        await generation.runner.start(AgentRunRequest(input="项目使用 uv", session_id="first"))
        base = resource_url(view)
        assert host.coordinator is not None
        await until(
            lambda: host.coordinator.snapshot().resources[0].state == "waiting_for_materials"
        )
        waiting = (await client.get(base + "/maintenance")).json()
        assert waiting["resource"]["pending_new_runs"] == 1
        assert waiting["resource"]["min_pending_runs"] == 2
        assert waiting["resource"]["next_eligible_at"] is None
        assert provider.learning_requests == []

        await generation.runner.start(AgentRunRequest(input="验证项目约定", session_id="second"))
        before_idle = (await client.get(base + "/maintenance")).json()
        assert before_idle["resource"]["state"] == "waiting_for_idle"
        assert before_idle["resource"]["next_eligible_at"] is not None
        assert provider.learning_requests == []
        await until(lambda: host.coordinator.snapshot().resources[0].last_result_ref is not None)
        assert len(provider.learning_requests) == 1
        payload = json.loads(provider.learning_requests[0].messages[-1].text)
        if kind == "memory":
            assert len(payload["records"]) == 4
            state = (await client.get(base + "/memory/generation")).json()
            assert state["pending_episodes"] == 0
            history = (await client.get(base + "/memory/generation-results")).json()["items"]
            assert any(
                item["stage"] == "flush" and item["status"] == "completed" for item in history
            )
        else:
            assert {item["source"]["session_id"] for item in payload["materials"]} == {
                "first",
                "second",
            }
            history = (await client.get(base + "/evolution/publications")).json()["items"]
            assert len(history) == 1 and history[0]["publication_state"] == "confirmed"
            assert history[0]["settled"] is True


@pytest.mark.parametrize("kind", ["memory", "evolution"])
async def test_manual_learning_bypasses_gates_but_waits_for_real_foreground(
    tmp_path: Path, kind: LearningKind
) -> None:
    """手动按钮绕过 3600 秒与十 Run 门槛，仍等待真实运行释放前台。"""
    provider = LearningProvider(kind)
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", learning_config(tmp_path, kind))
        session_response = await client.post(
            f"/api/stores/{view.store_binding_id}/sessions",
            json={"generation_id": view.generation_id},
        )
        session_id = session_response.json()["ref"]["session_id"]
        session = f"/api/stores/{view.store_binding_id}/sessions/{session_id}"
        provider.release.clear()
        try:
            submitted = await client.post(session + "/inputs", json={"input": "项目使用 uv"})
            assert submitted.status_code == 202, submitted.text
            await until(lambda: len(provider.requests) == 1)
            base = resource_url(view)
            command = "memory-cycle" if kind == "memory" else "experience"
            accepted = await client.post(
                base + f"/maintenance/{command}", json={"request_id": "manual"}
            )
            assert accepted.status_code == 202, accepted.text
            assert host.coordinator is not None
            await until(
                lambda: host.coordinator.snapshot().resources[0].pending_request_id is not None
            )
            blocked = (await client.get(base + "/maintenance")).json()
            assert blocked["foreground_count"] == 1
            assert blocked["resource"]["state"] == "waiting_for_foreground"
            assert provider.learning_requests == []
            pending = (await client.get(accepted.json()["location"])).json()
            assert pending["result"] is None
        finally:
            provider.release.set()
        await settle(host, view.store_binding_id, session_id)
        result = await operation(client, accepted)
        assert result["state"] == "succeeded", result
        assert len(provider.learning_requests) == 1
        if kind == "memory":
            assert [stage["stage"] for stage in result["result"]["results"]] == ["flush"]
            assert result["result"]["results"][0]["usage"]["total_tokens"] == 25
        else:
            assert result["result"]["status"] == "updated"
            detail = (
                await client.get(
                    base + "/evolution/publications/" + result["result"]["publication_id"]
                )
            ).json()
            assert detail["detail"]["materials"][0]["source"]["session_id"] == session_id


async def test_real_evolution_publications_expire_detail_after_ten_settlements(
    tmp_path: Path,
) -> None:
    """十一轮真实捕获和发布仅保留最近十次正文，过期记录仍可分页和读取。"""
    provider = LearningProvider("evolution")
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(
            host, client, tmp_path / "agent.yaml", learning_config(tmp_path, "evolution")
        )
        generation = host.generation(view.generation_id)
        base = resource_url(view)
        identities: list[str] = []
        for index in range(11):
            await generation.runner.start(AgentRunRequest(input=f"第 {index} 条项目约定：使用 uv"))
            result = await operation(
                client, await client.post(base + "/maintenance/experience", json={})
            )
            assert result["state"] == "succeeded" and result["result"]["status"] == "updated", (
                result
            )
            identities.append(result["result"]["publication_id"])
        first_page = (
            await client.get(base + "/evolution/publications", params={"limit": 1})
        ).json()
        assert first_page["items"][0]["publication_id"] == identities[0]
        assert first_page["items"][0]["detail_status"] == "expired"
        rest = (
            await client.get(
                base + "/evolution/publications", params={"after": first_page["next_cursor"]}
            )
        ).json()
        assert len(rest["items"]) == 10
        assert all(item["detail_status"] == "available" for item in rest["items"])
        expired = await client.get(base + "/evolution/publications/" + identities[0])
        assert expired.status_code == 200
        assert expired.json()["detail"] is None
        assert expired.json()["summary"]["settled"] is True
        second = (await client.get(base + "/evolution/publications/" + identities[1])).json()
        current = (await client.get(base + "/evolution/skill")).json()
        assert second["detail"]["publication_state"] == "confirmed"
        assert "第 2 次整理" in second["detail"]["candidate_documents"][0]["text"]
        assert "第 11 次整理" in current["data"]["text"]
        assert len(provider.learning_requests) == 11


async def test_unconfirmed_evolution_publication_survives_host_restart(tmp_path: Path) -> None:
    """真实文件发布后确认事务失败；新 host 保留未确认历史并拒绝冒充新请求完成。"""
    provider = LearningProvider("evolution")
    provider.revise_prompt = True
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    config = yaml.safe_load(learning_config(tmp_path, "evolution"))
    config["evolution"]["prompt_targets"] = ["compaction"]
    body = {"description": "精简摘要策略", "targets": [{"kind": "prompt", "name": "compaction"}]}
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", yaml.safe_dump(config))
        base = resource_url(view)
        binding = host.resources[view.resource_refs[0].resource_id].evolution
        assert binding is not None
        database_path = binding.service.store.path
        # 在实际数据库写边界制造确认失败，领域服务与文件发布均保持原实现。
        with sqlite3.connect(database_path) as database:
            database.execute(
                "CREATE TRIGGER fail_confirmation BEFORE UPDATE ON publications "
                "WHEN NEW.publication_state='confirmed' "
                "BEGIN SELECT RAISE(ABORT, 'confirmation interrupted'); END"
            )
        failed = await operation(
            client, await client.post(base + "/maintenance/revision", json=body)
        )
        assert failed["state"] == "succeeded" and failed["result"]["status"] == "failed", failed
        publication_id = failed["result"]["publication_id"]
        revision_id = failed["result"]["revision_id"]
        entry = (await client.get(base + "/evolution/publications/" + publication_id)).json()
        assert entry["detail"]["publication_state"] == "unconfirmed"
        archived = await binding.service.aget_publication(publication_id)
        assert archived is not None and archived.detail is not None
        assert archived.detail.after_documents == ()
        prompt_path = Path(entry["detail"]["candidate_documents"][0]["path"])
        assert prompt_path.read_text(encoding="utf-8") == "保留项目约定。"
    with sqlite3.connect(database_path) as database:
        database.execute("DROP TRIGGER fail_confirmation")

    reopened = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=reopened)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        restored = await reopened.apply(view.profile_id, "reopened")
        base = resource_url(restored)
        result = await operation(
            client, await client.post(base + "/maintenance/revision", json=body)
        )
        assert result["state"] == "failed", result
        assert "publication_unconfirmed" in result["error"]["message"]
        assert len(provider.learning_requests) == 1
        entry = (await client.get(base + "/evolution/publications/" + publication_id)).json()
        assert entry["summary"]["publication_state"] == "unconfirmed"
        assert entry["summary"]["settled"] is False
        assert entry["detail"]["published_at"] is None
        restored_binding = reopened.resources[restored.resource_refs[0].resource_id].evolution
        assert restored_binding is not None
        archived = await restored_binding.service.aget_publication(publication_id)
        assert archived is not None and archived.detail is not None
        assert archived.detail.after_documents == ()
        assert entry["detail"]["observed_documents"][0]["text"] == "保留项目约定。"
        requests = (await client.get(base + "/evolution/requests")).json()["items"]
        assert len(requests) == 2
        assert requests[0]["id"] == revision_id
        for request in requests:
            final = (await client.get(base + f"/evolution/revisions/{request['id']}/result")).json()
            assert final["data"] is None


async def test_admitted_memory_remainder_resumes_below_threshold_after_host_restart(
    tmp_path: Path,
) -> None:
    """首次手动准入的两 Run 受预算分批，重开后余下一 Run 不重新凑十个。"""
    provider = LearningProvider("memory")
    provider.count_records = True
    config = yaml.safe_load(learning_config(tmp_path, "memory"))
    config["memory"]["generation"]["flush_input_budget_tokens"] = 2
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", yaml.safe_dump(config))
        generation = host.generation(view.generation_id)
        for index in range(2):
            await generation.runner.start(AgentRunRequest(input=f"第 {index} 个完整 Run"))
        base = resource_url(view)
        result = await operation(
            client, await client.post(base + "/maintenance/memory-cycle", json={})
        )
        assert result["state"] == "succeeded" and result["result"]["has_more"] is True
        assert len(provider.learning_requests) == 1
        binding = host.resources[view.resource_refs[0].resource_id].memory
        assert binding is not None
        readiness = await binding.service.aread_learning_readiness(binding.namespace)
        assert len(readiness.sources) == 1 and readiness.sources[0].admitted
        pending = (await client.get(base + "/memory/generation")).json()
        assert pending["pending_episodes"] == 1

    config["maintenance"]["idle_seconds"] = 0
    (tmp_path / "agent.yaml").write_text(yaml.safe_dump(config), encoding="utf-8")
    reopened = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=reopened)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        restored = await reopened.apply(view.profile_id, "resume-admitted")
        assert reopened.coordinator is not None
        assert reopened.coordinator.min_pending_runs == 10
        await until(
            lambda: reopened.coordinator.snapshot().resources[0].last_result_ref is not None
        )
        assert len(provider.learning_requests) == 2
        base = resource_url(restored)
        state = (await client.get(base + "/memory/generation")).json()
        assert state["pending_episodes"] == 0
        history = (await client.get(base + "/memory/generation-results")).json()["items"]
        flushes = [item for item in history if item["stage"] == "flush"]
        assert len(flushes) == 2 and all(item["status"] == "completed" for item in flushes)
        first_refs = set(flushes[0]["input_ids"])
        assert first_refs.isdisjoint(flushes[1]["input_ids"])


class BudgetLearningProvider(Provider):
    """生成带真实原文引用的观察，并按预算允许时结算同一观察。"""

    def __init__(self) -> None:
        super().__init__()
        self.learning_requests: list[LLMRequest] = []

    def estimate_input_tokens(self, request: LLMRequest) -> int:
        """固定真实调用边界的估算，让配置预算一与二分别阻挡和放行。"""
        return 2

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """flush 引用捕获记录；dream 只结算本批真实 observation ID。"""
        self.learning_requests.append(request)
        payload = json.loads(request.messages[-1].text)
        if "records" in payload:
            output = {
                "observations": [
                    {
                        "text": "本项目使用 uv",
                        "applicability": "本项目",
                        "category": "reference",
                        "kind": "fact",
                        "reason": "用户明确约定",
                        "evidence": [payload["records"][0]["ref"]],
                    }
                ]
            }
        else:
            output = {
                "operations": [],
                "resolutions": [
                    {
                        "observation_id": observation["id"],
                        "target_id": None,
                        "reason": "已处理本项目约定，无新增知识",
                    }
                    for observation in payload["observations"]
                ],
            }
        return LLMResponse(
            provider="test",
            model="test",
            content=[TextBlock(text=json.dumps(output, ensure_ascii=False))],
            finish_reason="stop",
        )


async def test_retire_and_raise_budget_requalifies_persisted_blocked_observation(
    tmp_path: Path,
) -> None:
    """低预算持久阻挡观察，退役后调高配置使同一观察自动重新处理。"""
    provider = BudgetLearningProvider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    config = yaml.safe_load(learning_config(tmp_path, "memory", idle=0))
    config["memory"]["generation"]["dream_input_budget_tokens"] = 1
    path = tmp_path / "agent.yaml"
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, path, yaml.safe_dump(config))
        generation = host.generation(view.generation_id)
        await generation.runner.start(AgentRunRequest(input="本项目使用 uv", session_id="budget"))
        base = resource_url(view)
        assert host.coordinator is not None
        await until(
            lambda: host.coordinator.snapshot().resources[0].state == "waiting_for_materials"
        )
        assert host.coordinator.snapshot().resources[0].pending_new_runs == 1
        first = await operation(
            client, await client.post(base + "/maintenance/memory-cycle", json={})
        )
        assert first["state"] == "succeeded", first
        assert [(item["stage"], item["status"]) for item in first["result"]["results"]] == [
            ("flush", "completed"),
            ("dream", "blocked"),
        ]
        state = (await client.get(base + "/memory/generation")).json()
        assert state["pending_episodes"] == state["pending_observations"] == 0
        assert state["blocked_observations"] == 1
        [blocked] = (await client.get(base + "/memory/observations")).json()["items"]
        observation_id = blocked["observation"]["id"]
        assert blocked["status"] == "blocked" and blocked["blocked_budget"] == 1
        assert len(provider.learning_requests) == 1
        old_binding = host.resources[view.resource_refs[0].resource_id].memory
        assert old_binding is not None

        retired = await host.retire(generation)
        assert retired.state == "retired"
        config["memory"]["generation"]["dream_input_budget_tokens"] = 2
        config["maintenance"]["idle_seconds"] = 0
        path.write_text(yaml.safe_dump(config), encoding="utf-8")
        replacement = await host.apply(view.profile_id, "higher-dream-budget")
        new_binding = host.resources[replacement.resource_refs[0].resource_id].memory
        assert new_binding is not None
        assert new_binding.service is not old_binding.service
        assert new_binding.database_path == old_binding.database_path
        assert new_binding.service.generation_config.dream_input_budget_tokens == 2
        assert host.coordinator is not None and host.coordinator.min_pending_runs == 10
        await until(lambda: host.coordinator.snapshot().resources[0].last_result_ref is not None)

        base = resource_url(replacement)
        state = (await client.get(base + "/memory/generation")).json()
        assert state["blocked_observations"] == state["pending_observations"] == 0
        assert len(provider.learning_requests) == 2
        payload = json.loads(provider.learning_requests[-1].messages[-1].text)
        assert [item["id"] for item in payload["observations"]] == [observation_id]
        history = (await client.get(base + "/memory/generation-results")).json()["items"]
        dreams = [item for item in history if item["stage"] == "dream"]
        assert [item["status"] for item in dreams] == ["blocked", "completed"]
        assert dreams[0]["counts"]["blocked"] == 1
        assert dreams[1]["input_ids"] == [observation_id]
