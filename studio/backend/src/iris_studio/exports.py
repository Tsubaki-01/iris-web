"""选定真实运行的导出、导入与离线只读呈现。"""

from __future__ import annotations

import asyncio
import io
import json
import shutil
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Any
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, Response
from iris.lifecycle import LifecycleStore, RunCursor, RunPhase, RunRecord, snapshot_run
from pydantic import TypeAdapter, ValidationError

from .contracts import HostError, OperationAccepted, Page
from .dependencies import get_host
from .export_models import (
    ExportAsset,
    ExportedRun,
    ExportInput,
    SelectedRun,
    ShowcaseRecord,
    ShowcaseView,
)
from .files import get_image, get_tool, project_message, project_tool
from .media_models import UiImagePart, UiMessage
from .resources import StudioHost
from .viewer import VIEWER_CSS, VIEWER_JS, viewer_html

router = APIRouter(prefix="/api/showcases", tags=["showcases"])


def _directory(host: StudioHost, showcase_id: str) -> Path:
    if host.metadata.get("showcases", showcase_id) is None:
        raise HostError(404, "SHOWCASE_NOT_FOUND", "只读记录不存在")
    return host.data_dir / "showcases" / showcase_id


def _view(showcase_id: str, record: ShowcaseRecord, source: str) -> ShowcaseView:
    base = f"/api/showcases/{showcase_id}"
    return ShowcaseView.model_construct(
        showcase_id=showcase_id,
        title=record.title,
        created_at=record.captured_at,
        source=source,
        read_only=True,
        run_refs=[
            SelectedRun.model_construct(
                store_binding_id=item.store_binding_id, run_id=item.run.run_id
            )
            for item in record.runs
        ],
        manifest_url=f"{base}/manifest",
        record_url=f"{base}/record",
        download_url=f"{base}/download",
        view_url=f"{base}/view",
    )


def _manifest(record: ShowcaseRecord) -> dict[str, Any]:
    return {
        "schema_version": record.schema_version,
        "title": record.title,
        "captured_at": record.captured_at.isoformat(),
        "read_only": True,
        "runs": [
            {
                "source_id": item.source_id,
                "run_id": item.run.run_id,
                "phase": item.run.phase,
                "message_start": item.message_start,
                "message_end": item.message_end,
                "event_watermark": item.event_watermark,
            }
            for item in record.runs
        ],
        "missing": record.missing,
        "assets": [item.model_dump() for item in record.assets],
        "capture_note": "各公开读面分别捕获；运行中记录可能不完整，后续事实不会追加到此包。",
    }


def _write_bundle(directory: Path, record: ShowcaseRecord) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "record.json").write_text(record.model_dump_json(indent=2), encoding="utf-8")
    (directory / "manifest.json").write_text(
        json.dumps(_manifest(record), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (directory / "index.html").write_text(viewer_html(record), encoding="utf-8")
    (directory / "viewer.js").write_text(VIEWER_JS, encoding="utf-8")
    (directory / "viewer.css").write_text(VIEWER_CSS, encoding="utf-8")
    with zipfile.ZipFile(
        directory / "bundle.zip", "w", compression=zipfile.ZIP_DEFLATED
    ) as archive:
        for name in ("record.json", "manifest.json", "index.html", "viewer.js", "viewer.css"):
            archive.write(directory / name, name)
        for asset in record.assets:
            archive.write(directory / "assets" / asset.asset_id, f"assets/{asset.asset_id}")


def _lineage(store: LifecycleStore, run: RunRecord) -> dict[str, Any] | None:
    link = store.load_parent_link(run.run_id)
    if link is None:
        return None
    root = store.load_run(link.parent_run_id)
    ancestor = store.load_parent_link(root.run_id)
    while ancestor is not None:
        root = store.load_run(ancestor.parent_run_id)
        ancestor = store.load_parent_link(root.run_id)
    return {
        "root_session_id": root.session_id,
        "root_run_id": root.run_id,
        "parent_run_id": link.parent_run_id,
        "parent_tool_call_id": link.parent_tool_call_id,
        "child_run_id": run.run_id,
        "child_session_id": run.session_id,
        "agent_selector": link.agent_selector,
    }


async def _capture_run(host: StudioHost, selected: SelectedRun) -> ExportedRun:
    binding = host.binding(selected.store_binding_id)
    store = binding.store
    run = await asyncio.to_thread(store.load_run, selected.run_id)
    if run is None:
        raise HostError(404, "RUN_NOT_FOUND", "选中的运行不存在")
    end = run.terminal_session_message_count
    if end is None:
        header = await asyncio.to_thread(store.load_session_header, run.session_id)
        end = header.message_count
    messages: list[UiMessage] = []
    start = run.initial_session_message_count
    cursor = start
    while cursor < end:
        page = await asyncio.to_thread(
            store.read_session_messages, run.session_id, start=cursor, limit=min(100, end - cursor)
        )
        messages.extend(
            project_message(host, selected.store_binding_id, run.session_id, ordinal, msg)
            for ordinal, msg in page.items
        )
        if page.next_index is None:
            break
        cursor = page.next_index
    events = []
    sequence = 0
    while sequence < run.last_event_sequence:
        page_events = await asyncio.to_thread(store.list_events, run.run_id, sequence, limit=100)
        events.extend(event for event in page_events if event.sequence <= run.last_event_sequence)
        if not page_events:
            break
        sequence = page_events[-1].sequence
    tools = await asyncio.to_thread(store.list_tool_calls, run.run_id)
    lineage = await asyncio.to_thread(_lineage, store, run)
    return ExportedRun.model_construct(
        store_binding_id=selected.store_binding_id,
        source_id=binding.source_id,
        run=snapshot_run(run),
        result=await asyncio.to_thread(store.load_result, run.run_id),
        session_id=run.session_id,
        messages=messages,
        tools=[project_tool(host, selected.store_binding_id, item) for item in tools],
        events=events,
        lineage=lineage,
        message_start=start,
        message_end=end,
        event_watermark=run.last_event_sequence,
        evidence=host.evidence.export_run(selected.store_binding_id, run.run_id),
    )


async def export_showcase(host: StudioHost, body: ExportInput) -> ShowcaseView:
    """捕获选定运行及可选后代，复制本次明确选择的文件。"""
    showcase_id = f"showcase_{uuid4().hex}"
    directory = host.data_dir / "showcases" / showcase_id
    assets_dir = directory / "assets"
    assets_dir.mkdir(parents=True)
    pending = list(body.runs)
    seen: set[tuple[str, str]] = set()
    captures: list[ExportedRun] = []
    missing: list[str] = []
    while pending:
        selected = pending.pop(0)
        key = (selected.store_binding_id, selected.run_id)
        if key in seen:
            continue
        seen.add(key)
        capture = await _capture_run(host, selected)
        captures.append(capture)
        if capture.run.phase is not RunPhase.TERMINAL:
            missing.append(f"运行 {selected.run_id} 捕获时尚未结束。")
        if not capture.evidence.get("preparation"):
            missing.append(f"运行 {selected.run_id} 没有已采集的上下文准备正文。")
        if body.include_children:
            cursor: RunCursor | None = None
            while True:
                page = await asyncio.to_thread(
                    host.binding(selected.store_binding_id).store.list_child_runs,
                    selected.run_id,
                    after=cursor,
                    limit=50,
                )
                pending.extend(
                    SelectedRun.model_construct(
                        store_binding_id=selected.store_binding_id, run_id=item.run.run_id
                    )
                    for item in page.items
                )
                cursor = page.next_cursor
                if cursor is None:
                    break
    assets: list[ExportAsset] = []
    copied: dict[Path, str] = {}

    async def copy_asset(path: Path, mime_type: str) -> str | None:
        if path in copied:
            return copied[path]
        if not path.is_file():
            missing.append(f"文件副本已缺失：{path.name}")
            return None
        asset_id = uuid4().hex
        await asyncio.to_thread(shutil.copyfile, path, assets_dir / asset_id)
        relative = f"assets/{asset_id}"
        copied[path] = relative
        assets.append(
            ExportAsset.model_construct(
                asset_id=asset_id,
                name=path.name,
                mime_type=mime_type,
                size_bytes=path.stat().st_size,
            )
        )
        return relative

    async def copy_image(part: UiImagePart, capture: ExportedRun) -> None:
        block = get_image(host, capture.store_binding_id, capture.session_id, part.media.media_id)
        original = await copy_asset(block.original.path, block.original.mime_type)
        model = await copy_asset(block.model.path, block.model.mime_type)
        part.media.original_url = original or ""
        part.media.model_url = model or ""

    chosen = {
        (item.store_binding_id, item.run_id, item.tool_call_id) for item in body.artifact_selection
    }
    for capture in captures:
        for message in capture.messages:
            for part in message.parts:
                if part.type == "image":
                    await copy_image(part, capture)
                elif part.type == "tool_result":
                    for child in part.content:
                        if child.type == "image":
                            await copy_image(child, capture)
        for tool in capture.tools:
            if tool.result is None:
                continue
            for part in tool.result.content:
                if part.type == "image":
                    await copy_image(part, capture)
            artifact_view = tool.result.artifact
            if artifact_view is None:
                continue
            artifact_view.download_url = ""
            artifact_view.preview_url = None
            artifact_view.text_url = None
            key = (capture.store_binding_id, tool.run_id, tool.tool_call_id)
            if key not in chosen:
                missing.append(f"产物 {tool.tool_call_id} 未选择随包导出。")
                continue
            record = await asyncio.to_thread(get_tool, host, *key)
            artifact = record.result.artifact
            relative = await copy_asset(artifact.path, artifact.mime_type)
            artifact_view.download_url = relative or ""
            artifact_view.preview_url = relative
            if artifact.text_path:
                artifact_view.text_url = await copy_asset(artifact.text_path, "text/plain")
    publications: list[dict[str, Any]] = []
    for selected in body.publications:
        try:
            resource = host.resources[selected.resource_id]
        except KeyError as exc:
            raise HostError(404, "RESOURCE_NOT_FOUND", "发布记录所属资源尚未绑定") from exc
        if resource.evolution is not None:
            entry = await asyncio.to_thread(
                resource.evolution.service.get_publication, selected.publication_id
            )
            if entry is None:
                raise HostError(404, "PUBLICATION_NOT_FOUND", "发布记录不存在")
            data = TypeAdapter(type(entry)).dump_python(entry, mode="json")
            if entry.detail is None:
                missing.append(f"发布 {selected.publication_id} 的完整详情已过期。")
        else:
            service = resource.memory.service
            entry = await service.aget_publication(
                resource.memory.namespace, selected.publication_id
            )
            if entry is None:
                raise HostError(404, "PUBLICATION_NOT_FOUND", "发布记录不存在")
            data = TypeAdapter(type(entry)).dump_python(entry, mode="json")
        publications.append(
            {
                "resource_id": selected.resource_id,
                "publication_id": selected.publication_id,
                "record": data,
            }
        )
    record = ShowcaseRecord.model_construct(
        schema_version=1,
        title=body.title,
        captured_at=datetime.now(UTC),
        runs=captures,
        publications=publications,
        assets=assets,
        missing=missing,
    )
    await asyncio.to_thread(_write_bundle, directory, record)
    view = _view(showcase_id, record, "exported")
    host.metadata.put("showcases", showcase_id, view.model_dump(mode="json"))
    return view


async def import_showcase(host: StudioHost, payload: bytes) -> ShowcaseView:
    """只解析记录和列明的资源；不装配配置或执行任何 Agent。"""
    try:
        archive = zipfile.ZipFile(io.BytesIO(payload))
        with archive:
            record = ShowcaseRecord.model_validate_json(archive.read("record.json"))
            contents = {
                asset.asset_id: archive.read(f"assets/{asset.asset_id}") for asset in record.assets
            }
    except (zipfile.BadZipFile, KeyError, ValidationError) as exc:
        raise HostError(400, "INVALID_SHOWCASE", "不是有效的 Iris Studio 只读记录包") from exc
    showcase_id = f"showcase_{uuid4().hex}"
    directory = host.data_dir / "showcases" / showcase_id
    (directory / "assets").mkdir(parents=True)
    for asset_id, content in contents.items():
        await asyncio.to_thread((directory / "assets" / asset_id).write_bytes, content)
    await asyncio.to_thread(_write_bundle, directory, record)
    view = _view(showcase_id, record, "imported")
    host.metadata.put("showcases", showcase_id, view.model_dump(mode="json"))
    return view


@router.post("/export", status_code=202)
async def request_export(
    body: ExportInput, host: Annotated[StudioHost, Depends(get_host)]
) -> OperationAccepted:
    """启动宿主持有的选定记录导出。"""
    return host.operation("export", export_showcase(host, body), body.request_id)


@router.post("/import", status_code=202)
async def request_import(
    host: Annotated[StudioHost, Depends(get_host)], bundle: Annotated[UploadFile, File()]
) -> OperationAccepted:
    """读取本地记录包，不触发执行。"""
    return host.operation("import", import_showcase(host, await bundle.read()))


@router.get("")
async def list_showcases(
    host: Annotated[StudioHost, Depends(get_host)],
    after: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> Page[ShowcaseView]:
    """按宿主记录顺序浏览只读展示包。"""
    items = list(reversed(host.metadata.list("showcases")))
    if after is not None:
        match = next(
            (index for index, item in enumerate(items) if item["showcase_id"] == after), None
        )
        if match is None:
            raise HostError(422, "INVALID_CURSOR", "展示记录游标不存在")
        items = items[match + 1 :]
    selected = items[:limit]
    return Page[ShowcaseView](
        items=[ShowcaseView.model_validate(item) for item in selected],
        next_cursor=selected[-1]["showcase_id"] if len(items) > limit else None,
    )


@router.get("/{showcase_id}")
async def showcase(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> ShowcaseView:
    """读取只读包入口。"""
    _directory(host, showcase_id)
    return ShowcaseView.model_validate(host.metadata.get("showcases", showcase_id))


@router.get("/{showcase_id}/manifest")
async def manifest(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> dict[str, Any]:
    """读取实际捕获范围与缺失说明。"""
    return json.loads((_directory(host, showcase_id) / "manifest.json").read_text(encoding="utf-8"))


@router.get("/{showcase_id}/record")
async def record(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> ShowcaseRecord:
    """读取冻结标准记录；不查询运行中的主库。"""
    return ShowcaseRecord.model_validate_json(
        (_directory(host, showcase_id) / "record.json").read_bytes()
    )


@router.get("/{showcase_id}/download")
async def download(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> FileResponse:
    """下载解压后可直接打开的 ZIP。"""
    return FileResponse(
        _directory(host, showcase_id) / "bundle.zip",
        media_type="application/zip",
        filename=f"{showcase_id}.zip",
    )


@router.get("/{showcase_id}/assets/{asset_id}")
async def asset(
    showcase_id: str, asset_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> FileResponse:
    """仅提供当前包声明的资源。"""
    directory = _directory(host, showcase_id)
    data = ShowcaseRecord.model_validate_json((directory / "record.json").read_bytes())
    selected = next((item for item in data.assets if item.asset_id == asset_id), None)
    if selected is None:
        raise HostError(404, "ASSET_NOT_FOUND", "这个包没有该资源")
    return FileResponse(directory / "assets" / selected.asset_id, media_type=selected.mime_type)


@router.get("/{showcase_id}/view", response_class=HTMLResponse)
async def view(showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]) -> HTMLResponse:
    """在线使用与离线包相同的只读页面。"""
    return HTMLResponse((_directory(host, showcase_id) / "index.html").read_text(encoding="utf-8"))


@router.get("/{showcase_id}/viewer.js")
async def viewer_script(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> Response:
    """无执行客户端的经典脚本。"""
    _directory(host, showcase_id)
    return Response(VIEWER_JS, media_type="text/javascript")


@router.get("/{showcase_id}/viewer.css")
async def viewer_style(
    showcase_id: str, host: Annotated[StudioHost, Depends(get_host)]
) -> Response:
    """在线与离线共用展示样式。"""
    _directory(host, showcase_id)
    return Response(VIEWER_CSS, media_type="text/css")
