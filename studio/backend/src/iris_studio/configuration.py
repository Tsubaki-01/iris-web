"""原文配置草稿、逐文件保存与实际采用入口。"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Annotated, Literal

import yaml
from fastapi import APIRouter, Depends
from iris.agents import parse_agent_config
from iris.agents.config.subagent import load_subagent_catalog
from iris.context import load_context_build_input
from iris.decision.config import load_decision_config
from iris.exceptions import IrisError
from iris.harness import EffectiveConfiguration
from iris.mcp.config import load_mcp_config

from .contracts import (
    DTO,
    ConfigDiagnostic,
    ConfigDocument,
    ConfigDraft,
    ConfigValidation,
    GenerationView,
    HostError,
    OperationAccepted,
    OperationView,
    ProfileView,
    RequestId,
    StorageBindingView,
    WorkspaceView,
)
from .dependencies import get_host
from .resources import StudioHost, identifier

router = APIRouter(prefix="/api", tags=["configuration"])
Host = Annotated[StudioHost, Depends(get_host)]


class Bootstrap(DTO):
    """空启动也是完整合法工作台。"""

    backend_epoch: str
    workspaces: list[WorkspaceView]
    profiles: list[ProfileView]
    generations: list[GenerationView]
    storage_bindings: list[StorageBindingView]
    default_profile_id: str | None = None


class WorkspaceInput(DTO):
    """用户明确登记的工作目录。"""

    path: str
    title: str | None = None


class ProfileInput(DTO):
    """保留原 YAML 位置。"""

    workspace_id: str
    config_path: str
    title: str | None = None


class ProfileImported(DTO):
    """导入不会启动模型。"""

    profile: ProfileView
    draft: ConfigDraft
    validation: ConfigValidation


class DocumentEdit(DTO):
    """同源文本更新。"""

    document_id: str
    text: str


class DraftInput(DTO):
    """草稿 CAS revision。"""

    base_draft_revision: int
    documents: list[DocumentEdit]


class RevisionInput(DTO):
    """指定要验证或保存的草稿。"""

    draft_revision: int


class SaveInput(RevisionInput):
    """逐文件保存的显式选择。"""

    document_ids: list[str]


class SaveResult(DTO):
    """只更新成功写入的文件基线。"""

    config_revision_id: str
    saved_document_ids: list[str]
    draft: ConfigDraft


class ApplyInput(RequestId):
    """请求起点版本与实际采用版本分开。"""

    config_revision_id: str


class DocumentInput(DTO):
    """导入用户选择的真实来源文件。"""

    path: str
    kind: Literal["agent", "context", "mcp", "decision", "subagent_catalog", "prompt", "skill"]


def get_profile(host: StudioHost, profile_id: str) -> ProfileView:
    """读取持久 profile 声明。"""
    raw = host.metadata.get("profiles", profile_id)
    if raw is None:
        raise HostError(404, "PROFILE_NOT_FOUND", "配置入口不存在")
    return ProfileView.model_validate(raw)


def get_draft(host: StudioHost, profile_id: str) -> ConfigDraft:
    """草稿从主机元数据恢复。"""
    raw = host.metadata.get("drafts", profile_id)
    if raw is None:
        raise HostError(404, "PROFILE_NOT_FOUND", "配置草稿不存在")
    return ConfigDraft.model_validate(raw)


def check_revision(draft: ConfigDraft, revision: int) -> None:
    """草稿 mutation 的唯一 revision owner。"""
    if draft.draft_revision != revision:
        raise HostError(
            409, "DOCUMENT_CONFLICT", "草稿已被其它窗口修改", {"draft": draft.model_dump()}
        )


def validate_draft(draft: ConfigDraft) -> ConfigValidation:
    """验证当前 Agent 原文及明确标识的磁盘引用，不连接外部服务。"""
    main = next(document for document in draft.documents if document.kind == "agent")
    diagnostics: list[ConfigDiagnostic] = []
    checked = [f"draft:{main.document_id}"]
    config = None
    try:
        raw = yaml.safe_load(main.draft_text)
        config = parse_agent_config(raw, config_path=Path(main.original_path))
        loaders = []
        if config.context is not None:
            loaders.append(
                (
                    "context",
                    config.context.path,
                    lambda: load_context_build_input(config.context.path),
                )
            )
        if config.mcp is not None:
            loaders.append(
                (
                    "mcp",
                    config.mcp.path,
                    lambda: load_mcp_config(config.mcp.path, overrides=config.mcp.overrides),
                )
            )
        if config.decision is not None:
            loaders.append(
                (
                    "decision",
                    config.decision.path,
                    lambda: load_decision_config(config.decision.path),
                )
            )
        if config.tools.subagent is not None:
            catalog_path = (Path(main.original_path).parent / config.tools.subagent).resolve()
            loaders.append(
                ("subagent_catalog", catalog_path, lambda: load_subagent_catalog(catalog_path))
            )
        for kind, path, loader in loaders:
            document = next(
                (item for item in draft.documents if Path(item.original_path) == path), None
            )
            if document is not None and document.draft_text != document.base_text:
                diagnostics.append(
                    ConfigDiagnostic(
                        document_id=document.document_id,
                        message="引用文件草稿尚未保存；本次声明验证不代表该草稿已通过领域 loader",
                        severity="warning",
                    )
                )
                continue
            loader()
            checked.append(f"disk:{kind}:{path}")
    except (IrisError, yaml.YAMLError, ValueError, TypeError) as exc:
        diagnostics.append(
            ConfigDiagnostic(document_id=main.document_id, message=str(exc), severity="error")
        )
    return ConfigValidation(
        valid=not any(item.severity == "error" for item in diagnostics),
        checked_scope=checked,
        diagnostics=diagnostics,
        effective_agent_config=config,
    )


def read_document(path: Path, kind: str, revision: int) -> ConfigDocument:
    """捕获可编辑原文；不以 effective model 重写。"""
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise HostError(404, "DOCUMENT_NOT_FOUND", "配置文档不存在") from exc
    return ConfigDocument(
        document_id=identifier("document"),
        kind=kind,
        original_path=str(path.resolve()),
        base_text=text,
        draft_text=text,
        draft_revision=revision,
    )


@router.get("/bootstrap", response_model=Bootstrap)
async def bootstrap(host: Host) -> Bootstrap:
    """只读所有 host 入口。"""
    return Bootstrap(
        backend_epoch=host.backend_epoch,
        workspaces=host.metadata.list("workspaces"),
        profiles=host.metadata.list("profiles"),
        generations=[item.view() for item in host.generations.values()],
        storage_bindings=[item.view() for item in host.bindings.values()],
    )


@router.post("/workspaces", response_model=WorkspaceView, status_code=201)
async def workspace(body: WorkspaceInput, host: Host) -> WorkspaceView:
    """登记现有目录，不创建演示配置。"""
    path = Path(body.path).expanduser().resolve()
    if not path.is_dir():
        raise HostError(422, "WORKSPACE_NOT_FOUND", "工作目录不存在")
    for existing in host.metadata.list("workspaces"):
        if os.path.normcase(existing["path"]) == os.path.normcase(str(path)):
            return WorkspaceView.model_validate(existing)
    view = WorkspaceView(
        workspace_id=identifier("workspace"), path=str(path), title=body.title or path.name
    )
    host.metadata.put("workspaces", view.workspace_id, view.model_dump())
    return view


@router.post("/profiles/import", response_model=ProfileImported, status_code=201)
async def import_profile(body: ProfileInput, host: Host) -> ProfileImported:
    """导入已有 YAML 与其显式引用文档。"""
    workspace = host.metadata.get("workspaces", body.workspace_id)
    if workspace is None:
        raise HostError(404, "WORKSPACE_NOT_FOUND", "工作目录未登记")
    path = (Path(workspace["path"]) / body.config_path).resolve()
    main = read_document(path, "agent", 1)
    profile = ProfileView(
        profile_id=identifier("profile"),
        workspace_id=body.workspace_id,
        title=body.title or path.stem,
        config_path=str(path),
        saved_revision_id=identifier("revision"),
    )
    draft = ConfigDraft(profile_id=profile.profile_id, draft_revision=1, documents=[main])
    validation = validate_draft(draft)
    config = validation.effective_agent_config
    if config is not None:
        refs = [
            (kind, section.path)
            for kind, section in (
                ("context", config.context),
                ("mcp", config.mcp),
                ("decision", config.decision),
            )
            if section is not None
        ]
        if config.tools.subagent is not None:
            refs.append(("subagent_catalog", path.parent / config.tools.subagent))
        for kind, ref in refs:
            if ref.is_file():
                draft.documents.append(read_document(ref, kind, 1))
    host.metadata.put("profiles", profile.profile_id, profile.model_dump())
    host.metadata.put("drafts", profile.profile_id, draft.model_dump())
    return ProfileImported(profile=profile, draft=draft, validation=validation)


@router.get("/profiles/{profile_id}", response_model=ProfileView)
async def profile(profile_id: str, host: Host) -> ProfileView:
    """读取配置入口。"""
    return get_profile(host, profile_id)


@router.get("/profiles/{profile_id}/draft", response_model=ConfigDraft)
async def draft(profile_id: str, host: Host) -> ConfigDraft:
    """读取同源草稿。"""
    return get_draft(host, profile_id)


@router.put("/profiles/{profile_id}/draft", response_model=ConfigDraft)
async def edit_draft(profile_id: str, body: DraftInput, host: Host) -> ConfigDraft:
    """一次替换请求中的草稿文本。"""
    result = get_draft(host, profile_id)
    check_revision(result, body.base_draft_revision)
    documents = {item.document_id: item for item in result.documents}
    if any(item.document_id not in documents for item in body.documents):
        raise HostError(404, "DOCUMENT_NOT_FOUND", "草稿文档不存在")
    result.draft_revision += 1
    for item in body.documents:
        documents[item.document_id].draft_text = item.text
        documents[item.document_id].draft_revision = result.draft_revision
    host.metadata.put("drafts", profile_id, result.model_dump())
    return result


@router.post("/profiles/{profile_id}/documents/import", response_model=ConfigDraft)
async def import_document(profile_id: str, body: DocumentInput, host: Host) -> ConfigDraft:
    """增加用户明确选择的引用文件。"""
    result = get_draft(host, profile_id)
    path = (Path(get_profile(host, profile_id).config_path).parent / body.path).resolve()
    if any(item.original_path == str(path) for item in result.documents):
        return result
    if body.kind == "agent":
        raise HostError(422, "DOCUMENT_KIND_INVALID", "一个 profile 只包含一个主 Agent 文档")
    result.draft_revision += 1
    result.documents.append(read_document(path, body.kind, result.draft_revision))
    host.metadata.put("drafts", profile_id, result.model_dump())
    return result


@router.post("/profiles/{profile_id}/validate", response_model=ConfigValidation)
async def validate(profile_id: str, body: RevisionInput, host: Host) -> ConfigValidation:
    """返回声明诊断，不装配 provider/MCP。"""
    result = get_draft(host, profile_id)
    check_revision(result, body.draft_revision)
    return validate_draft(result)


@router.post("/profiles/{profile_id}/save", response_model=SaveResult)
async def save(profile_id: str, body: SaveInput, host: Host) -> SaveResult:
    """一次比较文件基线后原子替换，部分失败如实报告。"""
    result = get_draft(host, profile_id)
    check_revision(result, body.draft_revision)
    documents = {item.document_id: item for item in result.documents}
    if any(key not in documents for key in body.document_ids):
        raise HostError(404, "DOCUMENT_NOT_FOUND", "草稿文档不存在")
    selected = [documents[key] for key in dict.fromkeys(body.document_ids)]
    for document in selected:
        current = Path(document.original_path).read_text(encoding="utf-8")
        if current != document.base_text:
            raise HostError(
                409,
                "DOCUMENT_CONFLICT",
                "磁盘文件已发生变化",
                {"document_id": document.document_id, "current_text": current},
            )
    saved: list[str] = []
    for index, document in enumerate(selected):
        path = Path(document.original_path)
        temporary = path.with_name(f".{path.name}.{identifier('save')}.tmp")
        try:
            temporary.write_text(document.draft_text, encoding="utf-8", newline="")
            temporary.replace(path)
        except OSError as exc:
            temporary.unlink(missing_ok=True)
            host.metadata.put("drafts", profile_id, result.model_dump())
            raise HostError(
                500,
                "PARTIAL_SAVE",
                "部分文件保存失败",
                {
                    "saved_document_ids": saved,
                    "failed_document_ids": [document.document_id],
                    "remaining_document_ids": [item.document_id for item in selected[index + 1 :]],
                    "message": str(exc),
                },
            ) from exc
        document.base_text = document.draft_text
        saved.append(document.document_id)
    revision = identifier("revision")
    profile = get_profile(host, profile_id)
    profile.saved_revision_id = revision
    host.metadata.put("profiles", profile_id, profile.model_dump())
    host.metadata.put("drafts", profile_id, result.model_dump())
    return SaveResult(config_revision_id=revision, saved_document_ids=saved, draft=result)


@router.post("/profiles/{profile_id}/apply", response_model=OperationAccepted, status_code=202)
async def apply(profile_id: str, body: ApplyInput, host: Host) -> OperationAccepted:
    """接纳后台装配，结果从 operation 读取。"""
    host.guard_open()
    get_profile(host, profile_id)
    return host.operation("apply", host.apply(profile_id, body.config_revision_id), body.request_id)


@router.get("/generations/{generation_id}", response_model=GenerationView)
async def generation(generation_id: str, host: Host) -> GenerationView:
    """读取进程内实例的真实状态。"""
    return host.generation(generation_id).view()


@router.get("/generations/{generation_id}/configuration", response_model=EffectiveConfiguration)
async def configuration(generation_id: str, host: Host) -> EffectiveConfiguration:
    """读取构造时真实采用快照。"""
    return host.generation(generation_id).configuration


@router.post(
    "/generations/{generation_id}/retire", response_model=OperationAccepted, status_code=202
)
async def retire(generation_id: str, body: RequestId, host: Host) -> OperationAccepted:
    """显式退役；不自动取消正在运行的任务。"""
    return host.operation("retire", host.retire(host.generation(generation_id)), body.request_id)


@router.get("/operations/{operation_id}", response_model=OperationView)
async def operation(operation_id: str, host: Host) -> OperationView:
    """返回本进程持有的操作观察。"""
    if operation_id not in host.operations:
        raise HostError(404, "OPERATION_NOT_FOUND", "操作不存在或已随后端重启释放")
    return host.operations[operation_id]
