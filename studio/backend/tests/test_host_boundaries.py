"""跨实例恢复、维护共享和退休收口的真实 SDK 边界回归。"""

import asyncio
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from pathlib import Path

import httpx
import pytest
from iris.harness import AgentRunRequest
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
from test_host_core import Provider, config_text, setup_profile

from iris_studio.app import create_app
from iris_studio.contracts import HostError
from iris_studio.resources import StudioHost


class QuestionProvider(Provider):
    """第一个模型步骤发起真实 question 工具。"""

    async def stream(self, request: LLMRequest) -> AsyncIterator[ModelStreamEvent]:
        """实际 tool/HITL 由 Iris 执行。"""
        self.requests.append(request)
        response = LLMResponse(
            provider="test",
            model="test",
            content=[ToolUseBlock(id="ask", name="ask_question", input={"question": "是否继续？"})]
            if len(self.requests) == 1
            else [TextBlock(text="回答已收到")],
            finish_reason="tool_calls" if len(self.requests) == 1 else "stop",
        )
        scope = ModelStreamScope(
            model_stream_id=f"stream-{len(self.requests)}", provider="test", model="test", attempt=1
        )
        yield ModelResponseStarted(
            scope=scope, sequence=1, occurred_at=datetime.now(UTC), response_id="response"
        )
        yield ModelResponseCompleted(
            scope=scope,
            sequence=2,
            occurred_at=datetime.now(UTC),
            response=response,
            semantic_output_emitted=False,
        )


async def applied(host: StudioHost, client: httpx.AsyncClient, path: Path, content: str):
    """通过真实导入与应用登记配置。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    imported = await setup_profile(client, path)
    return await host.apply(imported["profile"]["profile_id"], "requested")


@pytest.mark.asyncio
async def test_cross_store_attach_builds_separate_generation_and_old_store_reopens(
    tmp_path: Path,
) -> None:
    """终态历史使用独立恢复实例，原实例保持自己的存储。"""
    provider = Provider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        one = await applied(
            host, client, tmp_path / "one.yaml", config_text(tmp_path, store="one.db")
        )
        two = await applied(
            host, client, tmp_path / "two.yaml", config_text(tmp_path, store="two.db")
        )
        first = host.generation(one.generation_id)
        await first.runner.start(AgentRunRequest(input="history", session_id="same-id"))
        second = host.generation(two.generation_id)
        host.register_session(second, "same-id", "其它存储会话")
        base = f"/api/stores/{one.store_binding_id}/sessions/same-id"
        before = (await client.get(base + "/bootstrap")).json()
        assert before["control"] is None
        attached = await client.post(base + "/attach", json={"generation_id": two.generation_id})
        assert attached.status_code == 200, attached.text
        result = attached.json()
        assert result["generation"]["store_binding_id"] == one.store_binding_id
        assert result["generation"]["generation_id"] != two.generation_id
        assert second.binding.store_binding_id == two.store_binding_id
        assert len(host.owners) == 2
        assert len(provider.requests) == 1
    reopened = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=reopened)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        history = await client.get(base + "/bootstrap")
        assert history.status_code == 200, history.text
        assert history.json()["control"] is None
        assert history.json()["session"]["generation_id"] is None
        assert len(provider.requests) == 1


@pytest.mark.asyncio
async def test_waiting_restore_retire_blocks_admission_but_allows_hitl(tmp_path: Path) -> None:
    """WAITING 历史必须 restore，退役等待已有 HITL 收口。"""
    provider = QuestionProvider()
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
            config_text(tmp_path) + "tools:\n  builtin: [human.ask]\n",
        )
        generation = host.generation(view.generation_id)
        waiting = await generation.runner.start(
            AgentRunRequest(input="question", session_id="waiting")
        )
        assert waiting.pending_interaction is not None, waiting
        base = f"/api/stores/{view.store_binding_id}/sessions/waiting"
        attached = await client.post(base + "/attach", json={"generation_id": view.generation_id})
        assert attached.status_code == 409, attached.text
        assert attached.json()["error"]["code"] == "SESSION_REQUIRES_RESTORE"
        restored = await client.post(
            base + "/restore",
            json={"generation_id": view.generation_id, "run_id": waiting.run.run_id},
        )
        assert restored.status_code == 202, restored.text
        assert restored.json()["receipt"]["disposition"] == "attached_waiting"
        assert "submit" not in restored.json()["receipt"]["control"]["allowed_commands"]
        retiring = asyncio.create_task(host.retire(generation))
        await asyncio.sleep(0)
        rejected = await client.post(base + "/inputs", json={"input": "不应准入"})
        assert rejected.status_code == 409
        assert generation.state == "retiring" and not retiring.done()
        resumed = await client.post(
            base + f"/interactions/{waiting.pending_interaction.interaction_id}/response",
            json={"response": {"kind": "question", "answer": "继续"}},
        )
        assert resumed.status_code == 202, resumed.text
        async with asyncio.timeout(10):
            result = await retiring
        assert result.state == "retired"
        assert (
            generation.binding.store.load_result(waiting.run.run_id).assistant_message.text
            == "回答已收到"
        )


@pytest.mark.asyncio
async def test_coordinator_conflict_covers_different_resources_and_releases(tmp_path: Path) -> None:
    """协调参数属于全部借用者，释放后才按新配置重建。"""
    provider = Provider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):

        def learning_config(path: Path, idle: int) -> str:
            return config_text(path, memory=True, idle=idle) + "  generation:\n    enabled: true\n"

        one = await applied(
            host, client, tmp_path / "one" / "agent.yaml", learning_config(tmp_path / "one", 300)
        )
        two = await applied(
            host, client, tmp_path / "two" / "agent.yaml", learning_config(tmp_path / "two", 300)
        )
        path = tmp_path / "three" / "agent.yaml"
        path.parent.mkdir()
        path.write_text(learning_config(path.parent, 301), encoding="utf-8")
        imported = await setup_profile(client, path)
        with pytest.raises(HostError) as caught:
            await host.apply(imported["profile"]["profile_id"], "requested")
        assert caught.value.error.code == "SHARED_RESOURCE_IN_USE"
        assert caught.value.error.details["conflict_scope"] == "coordinator"
        assert set(caught.value.error.details["occupying_generation_ids"]) == {
            one.generation_id,
            two.generation_id,
        }
        await host.retire(host.generation(one.generation_id))
        await host.retire(host.generation(two.generation_id))
        assert host.coordinator is None
        three = await host.apply(imported["profile"]["profile_id"], "requested")
        assert host.coordinator.idle_seconds == 301
        assert three.resource_refs


@pytest.mark.asyncio
async def test_completed_goal_does_not_block_generation_retirement(tmp_path: Path) -> None:
    """已完成目标保留历史，但无自动后继需要暂停。"""
    from iris.goal import GoalReason, GoalRef
    from iris.goal.service import GoalService

    host = StudioHost(tmp_path / "state", provider_factory=lambda _: Provider())
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
        owner = host.register_session(generation, "goal-session", "完成的目标")
        goals = GoalService(generation.binding.store, config=generation.config.goal)
        created = goals.create("goal-session", "已经验收的工作")
        goals.complete(
            GoalRef(goal_id=created.goal_id, revision=created.revision),
            reason=GoalReason(code="user", text="已经完成"),
        )
        assert (await owner.manager.goal.get()).goal.status.value == "completed"
        result = await host.retire(generation)
        assert result.state == "retired"
        assert host.owners == {}


@pytest.mark.asyncio
async def test_retire_tracks_waiting_session_restored_after_retirement_started(
    tmp_path: Path,
) -> None:
    """退役期间新附着的既有 WAITING 必须收口后才关闭 shared runner。"""

    class RaceProvider(QuestionProvider):
        async def stream(self, request: LLMRequest) -> AsyncIterator[ModelStreamEvent]:
            if self.requests:
                await self.release.wait()
            async for event in super().stream(request):
                yield event

    provider = RaceProvider()
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
            config_text(tmp_path) + "tools:\n  builtin: [human.ask]\n",
        )
        generation = host.generation(view.generation_id)
        waiting = await generation.runner.start(
            AgentRunRequest(input="waiting", session_id="later")
        )
        assert waiting.pending_interaction is not None
        provider.release.clear()
        active_owner = host.register_session(generation, "active", "正在运行")
        await active_owner.manager.submit("active")
        retiring = asyncio.create_task(host.retire(generation))
        await asyncio.sleep(0)
        base = f"/api/stores/{view.store_binding_id}/sessions/later"
        restored = await client.post(
            base + "/restore",
            json={"generation_id": view.generation_id, "run_id": waiting.run.run_id},
        )
        assert restored.status_code == 202, restored.text
        provider.release.set()
        async with asyncio.timeout(10):
            while generation.binding.store.load_session_lane("active") is not None:
                await asyncio.sleep(0.01)
        await asyncio.sleep(0.15)
        assert not retiring.done() and generation.state == "retiring"
        response = await client.post(
            base + f"/interactions/{waiting.pending_interaction.interaction_id}/response",
            json={"response": {"kind": "question", "answer": "收口"}},
        )
        assert response.status_code == 202, response.text
        async with asyncio.timeout(10):
            result = await retiring
        assert result.state == "retired"
        assert host.owners == {}
        assert generation.binding.store.load_session_lane("later") is None


@pytest.mark.asyncio
async def test_failed_prepare_discards_only_new_binding(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """新实例准备失败不能遗留多余 broker，既有实例仍可使用。"""
    from iris.exceptions import IrisConfigError
    from iris.harness import AgentRunner

    host = StudioHost(tmp_path / "state", provider_factory=lambda _: Provider())
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        old = await applied(
            host, client, tmp_path / "old.yaml", config_text(tmp_path, store="old.db")
        )
        path = tmp_path / "new.yaml"
        path.write_text(config_text(tmp_path, store="new.db"), encoding="utf-8")
        imported = await setup_profile(client, path)

        async def fail_prepare(self: AgentRunner) -> None:
            raise IrisConfigError("模拟依赖无法准备")

        with monkeypatch.context() as scoped:
            scoped.setattr(AgentRunner, "aprepare", fail_prepare)
            with pytest.raises(IrisConfigError):
                await host.apply(imported["profile"]["profile_id"], "requested")
        assert set(host.bindings) == {old.store_binding_id}
        assert len(host.metadata.list("bindings")) == 1
        assert host.generation(old.generation_id).state == "ready"


@pytest.mark.asyncio
async def test_cross_binding_live_cursor_rejected_without_losing_restart_gap(
    tmp_path: Path,
) -> None:
    """相同 session ID 不能跨存储复用当前 live cursor，旧进程 epoch 交 broker gap。"""
    from iris.streaming import LiveCursor, encode_live_cursor

    from iris_studio.contracts import StreamReady
    from iris_studio.streaming import subscribe

    host = StudioHost(tmp_path / "state", provider_factory=lambda _: Provider())
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        one = await applied(
            host, client, tmp_path / "one.yaml", config_text(tmp_path, store="one.db")
        )
        two = await applied(
            host, client, tmp_path / "two.yaml", config_text(tmp_path, store="two.db")
        )
        binding = host.binding(two.store_binding_id)
        ready = StreamReady(
            connection_id="connection",
            backend_epoch=host.backend_epoch,
            store_binding_id=two.store_binding_id,
            source_id=binding.source_id,
            resource_id=None,
            stream_epoch=binding.broker.current_epoch(),
            scope="session_tree",
            scope_id="same",
        )
        wrong = LiveCursor(
            stream_epoch=host.binding(one.store_binding_id).broker.current_epoch(),
            scope="session_tree",
            scope_id="same",
            after_live_sequence=0,
        )
        with pytest.raises(HostError) as error:
            subscribe(host, binding.broker, ready, encode_live_cursor(wrong))
        assert error.value.status == 409
        old = wrong.model_copy(update={"stream_epoch": "old-process"})
        stream = subscribe(host, binding.broker, ready, encode_live_cursor(old))
        await anext(stream)
        assert b"replay.gap" in await anext(stream)
        await stream.aclose()


@pytest.mark.asyncio
async def test_partial_save_updates_only_successful_document_baselines(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """第二文件 IO 失败保留未存草稿，首文件已保存事实不回滚。"""
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: Provider())
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        path = tmp_path / "agent.yaml"
        path.write_text(config_text(tmp_path), encoding="utf-8")
        prompt = tmp_path / "prompt.md"
        prompt.write_text("old prompt", encoding="utf-8")
        imported = await setup_profile(client, path)
        prefix = f"/api/profiles/{imported['profile']['profile_id']}"
        added = (
            await client.post(
                prefix + "/documents/import", json={"path": str(prompt), "kind": "prompt"}
            )
        ).json()
        documents = added["documents"]
        edited = (
            await client.put(
                prefix + "/draft",
                json={
                    "base_draft_revision": added["draft_revision"],
                    "documents": [
                        {
                            "document_id": documents[0]["document_id"],
                            "text": "# saved\n" + documents[0]["draft_text"],
                        },
                        {"document_id": documents[1]["document_id"], "text": "new prompt"},
                    ],
                },
            )
        ).json()
        actual_replace = Path.replace

        def replace(source: Path, target: Path) -> Path:
            if target == prompt:
                raise OSError("模拟第二文件写入失败")
            return actual_replace(source, target)

        with monkeypatch.context() as scoped:
            scoped.setattr(Path, "replace", replace)
            saved = await client.post(
                prefix + "/save",
                json={
                    "draft_revision": edited["draft_revision"],
                    "document_ids": [item["document_id"] for item in documents],
                },
            )
        assert saved.status_code == 500, saved.text
        assert saved.json()["error"]["code"] == "PARTIAL_SAVE"
        draft = (await client.get(prefix + "/draft")).json()
        assert draft["documents"][0]["base_text"].startswith("# saved")
        assert draft["documents"][1]["base_text"] == "old prompt"
        assert draft["documents"][1]["draft_text"] == "new prompt"


@pytest.mark.asyncio
async def test_http_steer_followup_pending_then_durable_and_live_contracts(tmp_path: Path) -> None:
    """运行中两类输入保持真实去向，future Run 未提交前不得伪造历史。"""
    from iris.streaming import LiveEnvelope, LiveSubscriptionRequest

    from iris_studio.contracts import SSE_PAYLOADS

    provider = Provider()
    provider.release.clear()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", config_text(tmp_path))
        generation = host.generation(view.generation_id)
        host.register_session(generation, "inputs", "并发输入")
        broker = generation.binding.broker
        subscription = broker.subscribe(
            LiveSubscriptionRequest(scope="session_tree", scope_id="inputs")
        )
        base = f"/api/stores/{view.store_binding_id}/sessions/inputs"
        initial = await client.post(base + "/inputs", json={"input": "第一轮"})
        assert initial.status_code == 202, initial.text
        async with asyncio.timeout(10):
            while not provider.requests:
                await asyncio.sleep(0.01)
        steer = await client.post(base + "/inputs", json={"input": "补充本轮", "mode": "steer"})
        following = await client.post(
            base + "/inputs", json={"input": "下一轮任务", "mode": "follow_up"}
        )
        assert steer.status_code == 202 and following.status_code == 202
        receipt = following.json()["receipt"]
        assert receipt["state"] == "pending"
        assert generation.binding.store.load_run(receipt["run_id"]) is None
        control = (await client.get(base + "/control")).json()["control"]
        assert {item["mode"] for item in control["pending"]} == {"steer", "follow_up"}
        provider.release.set()
        async with asyncio.timeout(10):
            while (
                generation.binding.store.load_result(receipt["run_id"]) is None
                or host.owner(view.store_binding_id, "inputs").manager.snapshot().pending
            ):
                await asyncio.sleep(0.01)
        runs = (await client.get(base + "/runs")).json()["items"]
        assert len(runs) == 2
        messages = (await client.get(base + "/messages")).json()["items"]
        user_text = [
            part["text"]
            for message in messages
            if message["role"] == "user"
            for part in message["parts"]
            if part["type"] == "text"
        ]
        assert (
            user_text.count("第一轮")
            == user_text.count("补充本轮")
            == user_text.count("下一轮任务")
            == 1
        )
        terminals = 0
        kinds: set[str] = set()
        async with asyncio.timeout(10):
            while terminals < 2:
                item = await anext(subscription)
                assert isinstance(item, LiveEnvelope)
                SSE_PAYLOADS[item.kind].model_validate(item.payload)
                kinds.add(item.kind)
                terminals += item.kind == "run.terminal"
        await subscription.aclose()
        assert {
            "model.block.delta",
            "context.preparation",
            "configuration.applied",
            "submission.pending",
            "session.control.changed",
        } <= kinds


@pytest.mark.asyncio
async def test_http_interrupt_returns_request_before_real_terminal(tmp_path: Path) -> None:
    """取消回执保留真实 phase，provider 返回后由 core 收口并清空 lane。"""
    provider = Provider()
    provider.release.clear()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", config_text(tmp_path))
        generation = host.generation(view.generation_id)
        host.register_session(generation, "cancel", "取消")
        base = f"/api/stores/{view.store_binding_id}/sessions/cancel"
        initial = await client.post(base + "/inputs", json={"input": "正在执行"})
        run_id = initial.json()["receipt"]["run_id"]
        async with asyncio.timeout(10):
            while not provider.requests:
                await asyncio.sleep(0.01)
        interrupted = await client.post(base + "/interrupt", json={"reason": "用户停止"})
        assert interrupted.status_code == 202, interrupted.text
        accepted = interrupted.json()["receipt"]["run"]
        assert accepted["run_id"] == run_id
        assert accepted["cancellation_reason"] == "用户停止"
        assert (
            "steer"
            not in (await client.get(base + "/control")).json()["control"]["allowed_commands"]
        )
        provider.release.set()
        async with asyncio.timeout(10):
            while generation.binding.store.load_result(run_id) is None:
                await asyncio.sleep(0.01)
        result = generation.binding.store.load_result(run_id)
        assert result.run.stop_reason.value == "cancelled"
        assert generation.binding.store.load_session_lane("cancel") is None


@pytest.mark.asyncio
async def test_fork_origin_survives_restart_and_attach(tmp_path: Path) -> None:
    """真实终态分支重启后接管，标题与固定来源均不被默认值覆盖。"""
    provider = Provider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        view = await applied(host, client, tmp_path / "agent.yaml", config_text(tmp_path))
        generation = host.generation(view.generation_id)
        source = await generation.runner.start(
            AgentRunRequest(input="已完成的来源", session_id="source")
        )
        forked = await client.post(
            f"/api/stores/{view.store_binding_id}/runs/{source.run.run_id}/fork",
            json={"generation_id": view.generation_id, "title": "保留分支标题"},
        )
        assert forked.status_code == 201, forked.text
        branch = forked.json()
        assert branch["forked_from_run_id"] == source.run.run_id
        binding_id = view.store_binding_id
        profile_id = view.profile_id
        branch_id = branch["ref"]["session_id"]
    reopened = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=reopened)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        actual = await reopened.apply(profile_id, "after-restart")
        assert actual.store_binding_id == binding_id
        base = f"/api/stores/{binding_id}/sessions/{branch_id}"
        before = (await client.get(base + "/bootstrap")).json()
        assert before["control"] is None
        assert before["session"]["forked_from_run_id"] == source.run.run_id
        attached = await client.post(base + "/attach", json={"generation_id": actual.generation_id})
        assert attached.status_code == 200, attached.text
        assert attached.json()["session"]["forked_from_run_id"] == source.run.run_id
        assert attached.json()["session"]["title"] == "保留分支标题"
        assert (await client.get(base)).json()["forked_from_run_id"] == source.run.run_id
        assert (
            reopened.binding(binding_id).store.load_session(branch_id).forked_from_run_id
            == source.run.run_id
        )
        assert len(provider.requests) == 1
