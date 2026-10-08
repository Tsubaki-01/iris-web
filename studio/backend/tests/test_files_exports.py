"""真实 Iris 运行、图片副本和离线记录的集成回归。"""

from __future__ import annotations

import asyncio
import io
import json
import zipfile
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from iris.lifecycle import AgentRunRequest
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
from iris.speech import SpeechClient, TranscriptionEvent
from PIL import Image

from iris_studio.app import create_app
from iris_studio.contracts import HostError, ProfileView
from iris_studio.export_models import ExportInput, SelectedArtifact, SelectedRun, ShowcaseRecord
from iris_studio.exports import export_showcase, import_showcase
from iris_studio.exports import router as export_router
from iris_studio.files import project_tool
from iris_studio.files import router as file_router
from iris_studio.resources import StudioHost


class ScriptedProvider:
    """只替换模型边界，其余采用实际 Iris 执行与持久化。"""

    def __init__(self, *, publish: bool = False) -> None:
        self.requests: list[LLMRequest] = []
        self.publish = publish

    def estimate_input_tokens(self, request: LLMRequest) -> int:
        """测试输入规模固定。"""
        return 10

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """先实际调用发布工具，然后返回包含 HTML 结束标记的文字。"""
        self.requests.append(request)
        if self.publish and len(self.requests) == 1:
            return LLMResponse(
                provider="controlled",
                id="tool-response",
                model="test",
                content=[
                    ToolUseBlock(
                        id="published", name="publish_artifact", input={"file_path": "report.txt"}
                    )
                ],
                finish_reason="tool_calls",
            )
        return LLMResponse(
            provider="controlled",
            id=f"response-{len(self.requests)}",
            model="test",
            content=[
                TextBlock(text="真实运行记录 </script><script>throw new Error('not code')</script>")
            ],
            finish_reason="stop",
        )

    async def stream(self, request: LLMRequest) -> AsyncIterator[ModelStreamEvent]:
        """实现宿主实际启用的 streaming 协议。"""
        response = await self.complete(request)
        scope = ModelStreamScope(
            model_stream_id=f"stream-{len(self.requests)}",
            provider="controlled",
            model="test",
            attempt=1,
        )
        yield ModelResponseStarted(
            scope=scope, sequence=1, occurred_at=datetime.now(UTC), response_id=response.id
        )
        yield ModelResponseCompleted(
            scope=scope,
            sequence=2,
            occurred_at=datetime.now(UTC),
            response=response,
            semantic_output_emitted=False,
        )


async def build_host(tmp_path: Path, provider: ScriptedProvider) -> tuple[StudioHost, str]:
    """通过配置 loader 和真实 host 装配独立实例。"""
    config_path = tmp_path / "agent.yaml"
    config_path.write_text(
        "name: media-agent\nmodel: openai/test\nsystem: test\n"
        "permissions:\n  workspace: .\n  writes: deny\n"
        "tools:\n  builtin: [file.publish]\n"
        "session:\n  backend: sqlite\n  path: lifecycle.db\n"
        "memory:\n  enabled: false\n",
        encoding="utf-8",
    )
    host = StudioHost(tmp_path / "host", provider_factory=lambda config: provider)
    await host.start()
    profile = ProfileView(
        profile_id="profile", workspace_id="workspace", title="test", config_path=str(config_path)
    )
    host.metadata.put("profiles", "profile", profile.model_dump())
    applied = await host.apply("profile", "requested")
    host.register_session(host.generation(applied.generation_id), "session", "Test")
    return host, applied.generation_id


def app_for(host: StudioHost) -> FastAPI:
    """把目标路由装配在同一测试 event loop，避免另建业务替身。"""
    app = FastAPI()
    app.state.host = host
    app.include_router(file_router)
    app.include_router(export_router)

    @app.exception_handler(HostError)
    async def host_error(request: Request, error: HostError) -> JSONResponse:
        return JSONResponse(status_code=error.status, content={"error": error.error.model_dump()})

    return app


def png_bytes() -> bytes:
    """构造可被 Iris 实际解码的小图。"""
    buffer = io.BytesIO()
    Image.new("RGB", (24, 12), "purple").save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.mark.asyncio
async def test_uploaded_media_survives_host_restart_and_scopes_to_session(tmp_path: Path) -> None:
    provider = ScriptedProvider()
    host, generation_id = await build_host(tmp_path, provider)
    binding = host.generation(generation_id).binding
    async with AsyncClient(
        transport=ASGITransport(app_for(host)), base_url="http://studio"
    ) as client:
        response = await client.post(
            f"/api/stores/{binding.store_binding_id}/sessions/session/media/images",
            files={"file": ("input.png", png_bytes(), "image/png")},
        )
        assert response.status_code == 201, response.text
        media = response.json()
        assert provider.requests == []
        assert (await client.get(media["original_url"])).content == png_bytes()
        assert (
            await client.get(
                media["original_url"].replace("/sessions/session/", "/sessions/other/")
            )
        ).status_code == 404
    await host.close()
    reopened = StudioHost(tmp_path / "host", provider_factory=lambda config: provider)
    await reopened.start()
    async with AsyncClient(
        transport=ASGITransport(app_for(reopened)), base_url="http://studio"
    ) as client:
        response = await client.get(media["model_url"])
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
    await reopened.close()


@pytest.mark.asyncio
async def test_full_tool_artifact_is_independent_of_workspace_source(tmp_path: Path) -> None:
    (tmp_path / "report.txt").write_text("published content", encoding="utf-8")
    host, generation_id = await build_host(tmp_path, ScriptedProvider(publish=True))
    generation = host.generation(generation_id)
    await generation.runner.start(
        AgentRunRequest(session_id="session", run_id="run", input="publish report")
    )
    record = generation.binding.store.load_tool_call("run", "published")
    assert record is not None and record.result is not None and record.result.artifact is not None
    projected = project_tool(host, generation.binding.store_binding_id, record)
    assert projected.result is not None and projected.result.artifact is not None
    assert projected.result.stats == record.result.stats
    (tmp_path / "report.txt").write_text("later edited source", encoding="utf-8")
    async with AsyncClient(
        transport=ASGITransport(app_for(host)), base_url="http://studio"
    ) as client:
        response = await client.get(projected.result.artifact.download_url)
        assert response.text == "published content"
        patch_url = projected.result.artifact.download_url.split("/artifact")[0] + "/file-change"
        assert (await client.get(patch_url)).json()["status"] == "not_triggered"
        record.result.artifact.path.unlink()
        missing = await client.get(projected.result.artifact.download_url)
        assert missing.status_code == 404
        assert missing.json()["error"]["code"] == "ARTIFACT_FILE_MISSING"
    await host.close()


@pytest.mark.asyncio
async def test_export_import_freezes_real_run_media_and_selected_artifact(tmp_path: Path) -> None:
    (tmp_path / "report.txt").write_text("artifact body", encoding="utf-8")
    provider = ScriptedProvider(publish=True)
    host, generation_id = await build_host(tmp_path, provider)
    generation = host.generation(generation_id)
    binding_id = generation.binding.store_binding_id
    image = await generation.runner.import_image(
        png_bytes(), session_id="session", name="actual input"
    )
    await generation.runner.start(
        AgentRunRequest(
            session_id="session", run_id="first", input=[TextBlock(text="first input"), image]
        )
    )
    await generation.runner.start(
        AgentRunRequest(session_id="session", run_id="later", input="later input must not appear")
    )
    view = await export_showcase(
        host,
        ExportInput(
            title="Actual record",
            runs=[SelectedRun(store_binding_id=binding_id, run_id="first")],
            artifact_selection=[
                SelectedArtifact(
                    store_binding_id=binding_id, run_id="first", tool_call_id="published"
                )
            ],
        ),
    )
    directory = host.data_dir / "showcases" / view.showcase_id
    record = ShowcaseRecord.model_validate_json((directory / "record.json").read_bytes())
    assert len(record.runs) == 1
    assert "later input must not appear" not in record.model_dump_json()
    assert any(message.role == "assistant" for message in record.runs[0].messages)
    image_part = next(
        part
        for message in record.runs[0].messages
        for part in message.parts
        if part.type == "image"
    )
    assert image_part.media.original_url.startswith("assets/")
    assert (directory / image_part.media.original_url).read_bytes() == png_bytes()
    assert record.runs[0].tools[0].result.artifact.download_url.startswith("assets/")
    html = (directory / "index.html").read_text(encoding="utf-8")
    assert "</script><script>throw" not in html
    embedded = html.split('<script type="application/json" id="record">')[1].split("</script>")[0]
    assert (
        "</script><script>throw"
        in json.loads(embedded)["runs"][0]["messages"][-1]["parts"][0]["text"]
    )
    with zipfile.ZipFile(directory / "bundle.zip") as archive:
        assert {"record.json", "manifest.json", "index.html", "viewer.js", "viewer.css"} <= set(
            archive.namelist()
        )
    calls = len(provider.requests)
    imported = await import_showcase(host, (directory / "bundle.zip").read_bytes())
    assert imported.source == "imported"
    assert len(provider.requests) == calls
    async with AsyncClient(
        transport=ASGITransport(app_for(host)), base_url="http://studio"
    ) as client:
        assert (await client.get(imported.view_url)).status_code == 200
        assert (await client.get(imported.record_url)).json()["runs"][0]["run"]["run_id"] == "first"
    await host.close()


@pytest.mark.asyncio
async def test_import_rejects_non_record_without_model_side_effect(tmp_path: Path) -> None:
    provider = ScriptedProvider()
    host, _ = await build_host(tmp_path, provider)
    with pytest.raises(HostError, match="有效"):
        await import_showcase(host, b"not a zip")
    assert provider.requests == []
    assert host.metadata.list("showcases") == []
    await host.close()


@pytest.mark.asyncio
async def test_http_upload_and_mixed_input_reaches_provider_and_durable_messages(
    tmp_path: Path,
) -> None:
    """验证浏览器真正使用的上传→文字与媒体ID→SDK输入链。"""
    provider = ScriptedProvider()
    host, generation_id = await build_host(tmp_path, provider)
    generation = host.generation(generation_id)
    base = f"/api/stores/{generation.binding.store_binding_id}/sessions/session"
    async with AsyncClient(
        transport=ASGITransport(create_app(host=host)), base_url="http://studio"
    ) as client:
        uploaded = await client.post(
            f"{base}/media/images", files={"file": ("actual.png", png_bytes(), "image/png")}
        )
        assert uploaded.status_code == 201
        media = uploaded.json()
        sent = await client.post(
            f"{base}/inputs",
            json={
                "input": [
                    {"type": "text", "text": "describe this actual image"},
                    {"type": "image", "media_id": media["media_id"]},
                ]
            },
        )
        assert sent.status_code == 202, sent.text
        run_id = sent.json()["receipt"]["run_id"]
        async with asyncio.timeout(10):
            while generation.binding.store.load_result(run_id) is None:
                await asyncio.sleep(0.01)
        assert len(provider.requests) == 1
        input_message = next(
            message
            for message in provider.requests[0].messages
            if message.text == "describe this actual image"
        )
        assert [block.type for block in input_message.blocks] == ["text", "image"]
        history = (await client.get(f"{base}/messages")).json()["items"]
        assert history[0]["parts"][0] == {"type": "text", "text": "describe this actual image"}
        assert history[0]["parts"][1]["media"]["media_id"] == media["media_id"]
        assert len(history) == 2
    await host.close()


def test_speech_pcm_stream_returns_full_snapshot_and_does_not_send_chat(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class Adapter:
        """记录真实 PCM 块的确定性语音边界。"""

        async def stream(self, audio: AsyncIterator[bytes]) -> AsyncIterator[TranscriptionEvent]:
            chunks = [chunk async for chunk in audio]
            assert chunks == [b"\x00\x01\x02\x03"]
            yield TranscriptionEvent("transcribed", True)

    monkeypatch.setattr(
        "iris_studio.files.create_speech_client", lambda config: SpeechClient(Adapter())
    )
    app = FastAPI()
    app.include_router(file_router)
    app.state.host = SimpleNamespace(
        generation=lambda key: SimpleNamespace(config=SimpleNamespace(speech=None)),
        guard_admission=lambda generation: None,
    )
    with TestClient(app).websocket_connect("/api/generations/generation/speech") as websocket:
        websocket.send_bytes(b"\x00\x01\x02\x03")
        websocket.send_json({"type": "finish"})
        assert websocket.receive_json() == {
            "type": "transcript",
            "text": "transcribed",
            "is_final": True,
        }
