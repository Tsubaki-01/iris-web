"""已知消息媒体、工具产物和语音输入的宿主路由。"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from contextlib import aclosing, suppress
from pathlib import Path
from typing import Annotated, Any
from urllib.parse import quote
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, WebSocket
from fastapi.responses import FileResponse
from iris.exceptions import IrisError
from iris.lifecycle import RunToolCallRecord
from iris.message import DataBlock, ImageBlock, Msg, TextBlock
from iris.speech import create_speech_client
from pydantic import ValidationError
from starlette.websockets import WebSocketDisconnect

from .contracts import HostError, Observation
from .dependencies import get_host
from .media_models import (
    ArtifactView,
    FileChange,
    ImageInput,
    MediaView,
    SpeechFinish,
    SpeechTranscript,
    TextSlice,
    UiDataPart,
    UiImagePart,
    UiMessage,
    UiPart,
    UiTextPart,
    UiToolCall,
    UiToolResult,
    UiToolResultPart,
    UiToolUsePart,
)
from .resources import StudioHost

router = APIRouter(prefix="/api", tags=["files"])


def _session_url(binding_id: str, session_id: str) -> str:
    return f"/api/stores/{quote(binding_id, safe='')}/sessions/{quote(session_id, safe='')}"


def register_image(
    host: StudioHost, binding_id: str, session_id: str, image: ImageBlock
) -> MediaView:
    """为真实图片登记稳定地址；原文在宿主重启后仍能读取。"""
    key = json.dumps([binding_id, session_id, str(image.original.path), str(image.model.path)])
    index = host.metadata.get("media-index", key)
    if index is None:
        media_id = f"media_{uuid4().hex}"
        host.metadata.put(
            "media",
            media_id,
            {
                "store_binding_id": binding_id,
                "session_id": session_id,
                "image": image.model_dump(mode="json"),
            },
        )
        host.metadata.put("media-index", key, {"media_id": media_id})
    else:
        media_id = index["media_id"]
    base = f"{_session_url(binding_id, session_id)}/media/{media_id}"
    return MediaView.model_construct(
        media_id=media_id,
        name=image.name,
        mime_type=image.original.mime_type,
        width=image.original.width,
        height=image.original.height,
        original_url=f"{base}/original",
        model_url=f"{base}/model",
    )


def get_image(host: StudioHost, binding_id: str, session_id: str, media_id: str) -> ImageBlock:
    """从持久媒体登记边界读取对应会话的图片。"""
    record = host.metadata.get("media", media_id)
    if record is None or (record["store_binding_id"], record["session_id"]) != (
        binding_id,
        session_id,
    ):
        raise HostError(404, "MEDIA_NOT_FOUND", "本会话没有这张图片")
    return ImageBlock.model_validate(record["image"])


def resolve_input_images(
    host: StudioHost, binding_id: str, session_id: str, value: str | list[TextBlock | ImageInput]
) -> str | list[DataBlock]:
    """把输入边界的媒体 ID 转成 Iris 已保存的图片块。"""
    if isinstance(value, str):
        return value
    return [
        block if block.type == "text" else get_image(host, binding_id, session_id, block.media_id)
        for block in value
    ]


def _data_part(host: StudioHost, binding_id: str, session_id: str, block: DataBlock) -> UiDataPart:
    if block.type == "text":
        return UiTextPart.model_construct(text=block.text)
    return UiImagePart.model_construct(
        name=block.name, media=register_image(host, binding_id, session_id, block)
    )


def project_message(
    host: StudioHost, binding_id: str, session_id: str, ordinal: int, msg: Msg
) -> UiMessage:
    """投影持久消息，不更改绝对 ordinal 或把工具回执改为用户输入。"""
    parts: list[UiPart] = []
    for block in msg.blocks:
        if block.type in ("text", "image"):
            parts.append(_data_part(host, binding_id, session_id, block))
        elif block.type == "tool_use":
            parts.append(
                UiToolUsePart.model_construct(id=block.id, name=block.name, input=block.input)
            )
        else:
            parts.append(
                UiToolResultPart.model_construct(
                    tool_use_id=block.tool_use_id,
                    name=block.name,
                    content=[
                        _data_part(host, binding_id, session_id, item) for item in block.content
                    ],
                    is_error=block.is_error,
                    metadata=block.metadata,
                )
            )
    return UiMessage.model_construct(
        ordinal=ordinal,
        role=msg.role,
        sender=msg.sender,
        timestamp=msg.timestamp,
        parts=parts,
        metadata=msg.metadata,
    )


def project_tool(host: StudioHost, binding_id: str, record: RunToolCallRecord) -> UiToolCall:
    """使用完整 durable record，保留 data、artifact、stats 和版本。"""
    result = record.result
    projected = None
    if result is not None:
        run = host.binding(binding_id).store.load_run(record.run_id)
        if run is None:
            raise HostError(404, "RUN_NOT_FOUND", "工具所属的运行不存在")
        artifact = result.artifact
        base = f"/api/stores/{quote(binding_id, safe='')}/runs/{quote(record.run_id, safe='')}/tools/{quote(record.tool_call_id, safe='')}"
        projected = UiToolResult.model_construct(
            tool_use_id=result.tool_use_id,
            tool_name=result.tool_name,
            content=[_data_part(host, binding_id, run.session_id, item) for item in result.content],
            is_error=result.is_error,
            error=result.error,
            data=result.data,
            artifact=None
            if artifact is None
            else ArtifactView.model_construct(
                mime_type=artifact.mime_type,
                size_bytes=artifact.size_bytes,
                preview=artifact.preview,
                download_url=f"{base}/artifact?download=true",
                preview_url=f"{base}/artifact",
                text_url=f"{base}/text"
                if artifact.text_path or artifact.mime_type.startswith("text/")
                else None,
            ),
            stats=result.stats,
            metadata=result.metadata,
            hook_feedback=result.hook_feedback,
        )
    return UiToolCall.model_construct(
        run_id=record.run_id,
        step_index=record.step_index,
        ordinal=record.ordinal,
        tool_call_id=record.tool_call_id,
        tool_name=record.tool_name,
        arguments=record.arguments,
        fingerprint=record.fingerprint,
        interaction_id=record.interaction_id,
        phase=record.phase,
        claim_activation_id=record.claim_activation_id,
        result=projected,
        version=record.version,
        created_at=record.created_at,
        updated_at=record.updated_at,
        claimed_at=record.claimed_at,
        committed_at=record.committed_at,
    )


def get_tool(
    host: StudioHost, binding_id: str, run_id: str, tool_call_id: str
) -> RunToolCallRecord:
    """直接读取领域 store 的完整工具事实。"""
    record = host.binding(binding_id).store.load_tool_call(run_id, tool_call_id)
    if record is None:
        raise HostError(404, "TOOL_CALL_NOT_FOUND", "工具调用不存在")
    return record


def _file_response(path: Path, mime_type: str, *, download: bool = False) -> FileResponse:
    if not path.is_file():
        raise HostError(404, "ARTIFACT_FILE_MISSING", "记录存在，但文件副本已不在磁盘上")
    return FileResponse(path, media_type=mime_type, filename=path.name if download else None)


@router.post("/stores/{store_binding_id}/sessions/{session_id}/media/images", status_code=201)
async def upload_image(
    store_binding_id: str,
    session_id: str,
    file: Annotated[UploadFile, File()],
    host: Annotated[StudioHost, Depends(get_host)],
    name: Annotated[str | None, Form()] = None,
) -> MediaView:
    """导入图片副本，尚不创建 Run 或发送消息。"""
    owner = host.owner(store_binding_id, session_id)
    host.guard_admission(owner.generation)
    image = await owner.generation.runner.import_image(
        await file.read(),
        session_id=session_id,
        name=name or file.filename,
    )
    return register_image(host, store_binding_id, session_id, image)


@router.get("/stores/{store_binding_id}/sessions/{session_id}/media/{media_id}/{variant}")
async def read_image(
    store_binding_id: str,
    session_id: str,
    media_id: str,
    variant: str,
    host: Annotated[StudioHost, Depends(get_host)],
) -> FileResponse:
    """读取已登记图片的原图或模型副本。"""
    image = get_image(host, store_binding_id, session_id, media_id)
    if variant not in ("original", "model"):
        raise HostError(404, "MEDIA_VARIANT_NOT_FOUND", "图片版本不存在")
    ref = image.original if variant == "original" else image.model
    return _file_response(ref.path, ref.mime_type)


@router.get("/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}")
async def read_tool(
    store_binding_id: str,
    run_id: str,
    tool_call_id: str,
    host: Annotated[StudioHost, Depends(get_host)],
) -> UiToolCall:
    """读取工具调用及其完整结果。"""
    record = await asyncio.to_thread(get_tool, host, store_binding_id, run_id, tool_call_id)
    return project_tool(host, store_binding_id, record)


@router.get("/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/artifact")
async def read_artifact(
    store_binding_id: str,
    run_id: str,
    tool_call_id: str,
    host: Annotated[StudioHost, Depends(get_host)],
    download: bool = False,
) -> FileResponse:
    """只读取这次工具已发布的副本。"""
    record = await asyncio.to_thread(get_tool, host, store_binding_id, run_id, tool_call_id)
    if record.result is None or record.result.artifact is None:
        raise HostError(404, "ARTIFACT_NOT_FOUND", "这次工具调用没有发布产物")
    artifact = record.result.artifact
    return _file_response(artifact.path, artifact.mime_type, download=download)


@router.get("/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/text")
async def read_tool_text(
    store_binding_id: str,
    run_id: str,
    tool_call_id: str,
    host: Annotated[StudioHost, Depends(get_host)],
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100000)] = 8000,
) -> TextSlice:
    """按字符窗口读取 offload 正文，或工具原有的模型文字。"""
    record = await asyncio.to_thread(get_tool, host, store_binding_id, run_id, tool_call_id)
    if record.result is None:
        raise HostError(404, "TOOL_RESULT_NOT_READY", "工具结果尚未提交")
    result = record.result
    artifact = result.artifact
    path = artifact.text_path if artifact else None
    if path is None and artifact and artifact.mime_type.startswith("text/"):
        path = artifact.path
    if path is not None:
        if not path.is_file():
            raise HostError(404, "ARTIFACT_FILE_MISSING", "完整正文副本已不在磁盘上")
        text = await asyncio.to_thread(path.read_text, encoding="utf-8")
    else:
        text = result.model_content
    end = min(offset + limit, len(text))
    return TextSlice.model_construct(
        text=text[offset:end],
        next_offset=end if end < len(text) else None,
        has_more=end < len(text),
    )


@router.get("/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/file-change")
async def read_file_change(
    store_binding_id: str,
    run_id: str,
    tool_call_id: str,
    host: Annotated[StudioHost, Depends(get_host)],
) -> Observation[FileChange]:
    """呈现已提交 edit_file 的 patch，不读取当前文件重建历史。"""
    record = await asyncio.to_thread(get_tool, host, store_binding_id, run_id, tool_call_id)
    change = record.result.data.get("file_change") if record.result else None
    if change is None:
        return Observation(status="not_triggered", data=None, reason="这次工具没有文件变更记录")
    return Observation(status="available", data=FileChange.model_construct(**change), reason=None)


@router.websocket("/generations/{generation_id}/speech")
async def transcribe(websocket: WebSocket, generation_id: str) -> None:
    """转录浏览器 PCM；成功的最终文字仍由用户确认发送。"""
    host: StudioHost = websocket.app.state.host
    await websocket.accept()
    worker: asyncio.Task[None] | None = None
    receive: asyncio.Task[dict[str, Any]] | None = None
    try:
        generation = host.generation(generation_id)
        host.guard_admission(generation)
        client = create_speech_client(generation.config.speech)
        if client is None:
            raise HostError(409, "CAPABILITY_DISABLED", "当前实例未启用语音输入")
        chunks: asyncio.Queue[bytes | None] = asyncio.Queue()

        async def audio() -> AsyncIterator[bytes]:
            while (chunk := await chunks.get()) is not None:
                yield chunk

        async def send_transcripts() -> None:
            async with aclosing(client.stream(audio())) as stream:
                async for event in stream:
                    await websocket.send_json(
                        SpeechTranscript.model_construct(
                            text=event.text, is_final=event.is_final
                        ).model_dump()
                    )

        worker = asyncio.create_task(send_transcripts())
        while True:
            receive = asyncio.create_task(websocket.receive())
            done, _ = await asyncio.wait((receive, worker), return_when=asyncio.FIRST_COMPLETED)
            if worker in done:
                receive.cancel()
                with suppress(asyncio.CancelledError):
                    await receive
                await worker
                break
            message = await receive
            if message["type"] == "websocket.disconnect":
                raise WebSocketDisconnect(message.get("code", 1000))
            if message.get("bytes") is not None:
                await chunks.put(message["bytes"])
            else:
                SpeechFinish.model_validate_json(message["text"])
                await chunks.put(None)
                await worker
                break
        await websocket.close()
    except WebSocketDisconnect:
        pass
    except (HostError, IrisError, ValidationError) as exc:
        await websocket.send_json({"type": "error", "message": str(exc)})
        await websocket.close(code=1011)
    finally:
        pending = [task for task in (worker, receive) if task is not None and not task.done()]
        for task in pending:
            task.cancel()
        await asyncio.gather(*pending, return_exceptions=True)
