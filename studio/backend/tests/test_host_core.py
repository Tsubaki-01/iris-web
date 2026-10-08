"""使用真实 Iris SDK 验证配置采用、exact owner 与历史继续。"""

import asyncio
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from pathlib import Path

import httpx
import pytest
from iris.message import (
    LLMRequest,
    LLMResponse,
    ModelBlockCompleted,
    ModelBlockDelta,
    ModelBlockRef,
    ModelBlockStarted,
    ModelResponseCompleted,
    ModelResponseStarted,
    ModelStreamEvent,
    ModelStreamScope,
    TextBlock,
)

from iris_studio.app import create_app
from iris_studio.contracts import HostError, StreamReady
from iris_studio.resources import StudioHost
from iris_studio.streaming import subscribe


class Provider:
    """确定性模型边界，生命周期仍由真实 SDK 执行。"""

    def __init__(self) -> None:
        self.requests: list[LLMRequest] = []
        self.release = asyncio.Event()
        self.release.set()

    def estimate_input_tokens(self, request: LLMRequest) -> int:
        """测试只关注生命周期。"""
        return 1

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """记录实际请求后返回固定响应。"""
        self.requests.append(request)
        await self.release.wait()
        return LLMResponse(
            provider="test",
            model="test",
            content=[TextBlock(text="真实测试结果")],
            finish_reason="stop",
        )

    async def stream(self, request: LLMRequest) -> AsyncIterator[ModelStreamEvent]:
        """遵循当前流式协议提供受控模型事件。"""
        self.requests.append(request)
        await self.release.wait()
        scope = ModelStreamScope(
            model_stream_id=f"stream-{len(self.requests)}", provider="test", model="test", attempt=1
        )
        now = datetime.now(UTC)
        block = ModelBlockRef(index=0, block_id="text", kind="text")
        response = LLMResponse(
            provider="test",
            model="test",
            content=[TextBlock(text="真实测试结果")],
            finish_reason="stop",
        )
        yield ModelResponseStarted(scope=scope, sequence=1, occurred_at=now, response_id="response")
        yield ModelBlockStarted(scope=scope, sequence=2, occurred_at=now, block=block)
        yield ModelBlockDelta(
            scope=scope,
            sequence=3,
            occurred_at=now,
            block=block,
            channel="text",
            delta="真实测试结果",
            snapshot="真实测试结果",
        )
        yield ModelBlockCompleted(scope=scope, sequence=4, occurred_at=now, block=block)
        yield ModelResponseCompleted(
            scope=scope,
            sequence=5,
            occurred_at=now,
            response=response,
            semantic_output_emitted=True,
        )


def config_text(
    workspace: Path,
    *,
    system: str = "A",
    store: str = "runs.db",
    memory: bool = False,
    idle: int = 300,
) -> str:
    """生成只用于测试的显式配置。"""
    return f"name: test\nmodel: openai/test\nsystem: {system}\npermissions:\n  workspace: '{workspace.as_posix()}'\nsession:\n  backend: sqlite\n  path: '{store}'\nmaintenance:\n  idle_seconds: {idle}\nmemory:\n  enabled: {str(memory).lower()}\n"


async def setup_profile(client: httpx.AsyncClient, path: Path) -> dict:
    """通过用户正常 HTTP 流程导入配置。"""
    workspace = (await client.post("/api/workspaces", json={"path": str(path.parent)})).json()
    response = await client.post(
        "/api/profiles/import",
        json={"workspace_id": workspace["workspace_id"], "config_path": str(path)},
    )
    assert response.status_code == 201, response.text
    return response.json()


async def settle(host: StudioHost, binding_id: str, session_id: str) -> None:
    """等待真实 manager 完成结算。"""
    async with asyncio.timeout(10):
        while host.owner(binding_id, session_id).manager.snapshot().driver_state != "idle":
            await asyncio.sleep(0.01)


@pytest.mark.asyncio
async def test_clean_host_real_adoption_shared_store_chat_and_history(tmp_path: Path) -> None:
    """空启动无调用；A请求采用B；并行apply同库；历史无伪控制。"""
    provider = Provider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        empty = (await client.get("/api/bootstrap")).json()
        assert empty["profiles"] == [] and provider.requests == []
        path = tmp_path / "agent.yaml"
        path.write_text(config_text(tmp_path), encoding="utf-8")
        imported = await setup_profile(client, path)
        profile = imported["profile"]
        path.write_text(config_text(tmp_path, system="B"), encoding="utf-8")
        first, second = await asyncio.gather(
            host.apply(profile["profile_id"], profile["saved_revision_id"]),
            host.apply(profile["profile_id"], profile["saved_revision_id"]),
        )
        assert first.store_binding_id == second.store_binding_id
        generation = host.generation(first.generation_id)
        assert generation.configuration.agent_config.system == "B"
        assert first.config_revision_id != first.requested_config_revision_id
        assert generation.configuration.source_documents[0].text == path.read_text(encoding="utf-8")
        base = f"/api/stores/{first.store_binding_id}"
        response = await client.post(
            base + "/sessions", json={"generation_id": first.generation_id}
        )
        assert response.status_code == 201, response.text
        session_id = response.json()["ref"]["session_id"]
        session_url = base + f"/sessions/{session_id}"
        before = (await client.get(session_url + "/bootstrap")).json()
        assert before["messages"]["items"] == [] and before["session"]["has_durable_state"] is False
        submitted = await client.post(session_url + "/inputs", json={"input": "用户输入"})
        assert submitted.status_code == 202, submitted.text
        await settle(host, first.store_binding_id, session_id)
        after = (await client.get(session_url + "/bootstrap")).json()
        assert [item["ordinal"] for item in after["messages"]["items"]] == [0, 1]
        assert after["messages"]["items"][-1]["parts"][0]["text"] == "真实测试结果"
        owner = host.owners.pop((first.store_binding_id, session_id))
        await owner.manager.close()
        history = (await client.get(session_url + "/bootstrap")).json()
        assert history["control"] is None and history["session"]["generation_id"] is None
        attached = await client.post(
            session_url + "/attach", json={"generation_id": first.generation_id}
        )
        assert attached.status_code == 200, attached.text
        assert len(provider.requests) == 1
        continuation = await client.post(session_url + "/inputs", json={"input": "继续"})
        assert continuation.status_code == 202, continuation.text
        await settle(host, first.store_binding_id, session_id)


@pytest.mark.asyncio
async def test_stream_ready_registered_before_bootstrap_and_disconnect_keeps_owner(
    tmp_path: Path,
) -> None:
    """ready 首帧之后的输入事实已在队列，观察关闭不取消。"""
    provider = Provider()
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: provider)
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        path = tmp_path / "agent.yaml"
        path.write_text(config_text(tmp_path), encoding="utf-8")
        imported = await setup_profile(client, path)
        view = await host.apply(imported["profile"]["profile_id"], "requested")
        binding = host.binding(view.store_binding_id)
        host.register_session(host.generation(view.generation_id), "session", "测试")
        ready = StreamReady(
            connection_id="connection",
            backend_epoch=host.backend_epoch,
            store_binding_id=view.store_binding_id,
            source_id=binding.source_id,
            resource_id=None,
            stream_epoch=binding.broker.current_epoch(),
            scope="session_tree",
            scope_id="session",
        )
        frames = subscribe(host, binding.broker, ready, None)
        assert (await anext(frames)).startswith(b"event: stream.ready\n")
        await host.owner(view.store_binding_id, "session").manager.submit("测试")
        async with asyncio.timeout(5):
            frame = await anext(frames)
        assert b"id: " in frame
        await frames.aclose()
        await settle(host, view.store_binding_id, "session")
        assert len(provider.requests) == 1
        assert (
            host.owner(view.store_binding_id, "session").manager.snapshot().driver_state == "idle"
        )


@pytest.mark.asyncio
async def test_save_conflict_preserves_comments_and_retire_rejects_input(tmp_path: Path) -> None:
    """单 owner 比较文本基线，退役实例不再准入。"""
    host = StudioHost(tmp_path / "state", provider_factory=lambda _: Provider())
    app = create_app(host=host)
    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client,
    ):
        path = tmp_path / "agent.yaml"
        original = "# 保留注释\n" + config_text(tmp_path)
        path.write_text(original, encoding="utf-8")
        imported = await setup_profile(client, path)
        profile_id = imported["profile"]["profile_id"]
        document = imported["draft"]["documents"][0]
        edit = await client.put(
            f"/api/profiles/{profile_id}/draft",
            json={
                "base_draft_revision": 1,
                "documents": [
                    {
                        "document_id": document["document_id"],
                        "text": original.replace("system: A", "system: 草稿"),
                    }
                ],
            },
        )
        path.write_text(original + "# 外部写入\n", encoding="utf-8")
        save = await client.post(
            f"/api/profiles/{profile_id}/save",
            json={
                "draft_revision": edit.json()["draft_revision"],
                "document_ids": [document["document_id"]],
            },
        )
        assert save.status_code == 409
        assert save.json()["error"]["details"]["current_text"].endswith("# 外部写入\n")
        view = await host.apply(profile_id, "requested")
        generation = host.generation(view.generation_id)
        await host.retire(generation)
        with pytest.raises(HostError, match="退役"):
            host.guard_admission(generation)
