"""长期能力 HTTP 入口；所有领域状态和维护资格由 Iris SDK 拥有。"""

from __future__ import annotations

import asyncio
from functools import partial
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from iris.evolution import (
    EvolutionHistoryCursor,
    EvolutionResult,
    EvolutionSession,
    EvolutionSource,
    PublicationHistoryEntry,
    PublicationSummary,
    RevisionItem,
    RevisionRequest,
    RevisionRequestSummary,
    RevisionTarget,
)
from iris.goal import GoalControlResult, GoalView
from iris.goal.service import GoalService
from iris.harness.maintenance_models import ResourceMaintenanceView
from iris.lifecycle import AgentRunOptions
from iris.memory import (
    GenerationResult,
    GenerationState,
    MemoryCategory,
    MemoryEpisode,
    MemoryEvent,
    MemoryHistoryCursor,
    MemoryItem,
    MemoryItemKind,
    MemoryOverviewDocument,
    MemoryPublicationRecord,
)
from iris.memory.generation_models import ObservationState
from iris.todo import TodoSnapshot
from iris.todo.document import read_todo
from iris.utils.files import atomic_write_text
from pydantic import BaseModel, ConfigDict, Field, TypeAdapter, ValidationError

from .contracts import HostError, Observation, OperationAccepted, Page, ResourceRef, SessionRef
from .dependencies import get_host

router = APIRouter(prefix="/api", tags=["learning"])
Host = Annotated[Any, Depends(get_host)]


class Items[T](BaseModel):
    """不使用游标的当前短列表。"""

    items: list[T] | tuple[T, ...]


class RequestBody(BaseModel):
    """宿主请求关联，不提供隐式幂等保证。"""

    model_config = ConfigDict(extra="forbid")
    request_id: str | None = None


class GoalCreateBody(RequestBody):
    """创建目标的原始公开输入。"""

    objective: str
    max_rounds: int | None = None
    run_options: AgentRunOptions | None = None


class GoalEditBody(RequestBody):
    """编辑目标，并由原控制器暂停后续推进。"""

    objective: str | None = None
    max_rounds: int | None = None
    run_options: AgentRunOptions | None = None


class GoalReasonBody(RequestBody):
    """用户暂停或完成的原因。"""

    reason: str


class GoalResumeBody(RequestBody):
    """恢复目标的原 activation fence。"""

    expected_activation_id: str | None = None


class GoalReply(BaseModel):
    """原 Goal 控制结果及请求关联。"""

    request_id: str | None
    result: GoalControlResult


class ResourcesView(BaseModel):
    """Generation 实际借用的资源。"""

    resources: list[ResourceRef]


class MaintenanceView(BaseModel):
    """协调器对 exact resource 的真实短投影。"""

    coordinator_id: str
    revision: int
    foreground_count: int
    resource: ResourceMaintenanceView


class RevisionBody(RequestBody):
    """显式有限修订请求。"""

    description: str
    targets: tuple[RevisionTarget, ...] = Field(min_length=1)
    session: SessionRef | None = None


class EvolutionSources(BaseModel):
    """只展示尚待处理的来源短身份。"""

    pending_sources: tuple[EvolutionSource, ...]
    pending_sessions: tuple[EvolutionSession, ...]


class SkillDocument(BaseModel):
    """当前真实项目经验文件。"""

    file_path: str
    text: str


class TodoDocument(BaseModel):
    """当前 Todo 文件原文，缺失文件使用 null 基线。"""

    path: str
    text: str | None
    snapshot: TodoSnapshot


class TodoEditBody(BaseModel):
    """原文基线比较一次，拒绝覆盖其他编辑。"""

    model_config = ConfigDict(extra="forbid")
    base_text: str | None
    text: str


def _resource(host: Any, resource_id: str) -> Any:
    resource = host.resources.get(resource_id)
    if resource is None:
        raise HostError(404, "NOT_FOUND", "资源不存在")
    return resource


def _memory(host: Any, resource_id: str) -> Any:
    binding = _resource(host, resource_id).memory
    if binding is None:
        raise HostError(409, "CAPABILITY_DISABLED", "此资源不是 Memory")
    return binding


def _evolution(host: Any, resource_id: str) -> Any:
    binding = _resource(host, resource_id).evolution
    if binding is None:
        raise HostError(409, "CAPABILITY_DISABLED", "此资源不是 Evolution")
    return binding


def _cursor[T](value: str | None, cursor_type: type[T]) -> T | None:
    if value is None:
        return None
    try:
        return TypeAdapter(cursor_type).validate_json(value)
    except ValidationError as exc:
        raise HostError(422, "INVALID_CURSOR", str(exc)) from exc


def _page(page: Any) -> Page[Any]:
    cursor = page.next_cursor
    encoded = None if cursor is None else TypeAdapter(type(cursor)).dump_json(cursor).decode()
    return Page(items=page.items, next_cursor=encoded)


def _found[T](value: T | None) -> T:
    if value is None:
        raise HostError(404, "NOT_FOUND", "记录不存在")
    return value


def _goal_owner(host: Any, binding_id: str, session_id: str) -> Any:
    owner = host.owner(binding_id, session_id)
    if not owner.generation.config.goal.enabled:
        raise HostError(409, "CAPABILITY_DISABLED", "Goal 未启用")
    return owner


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/goal", response_model=Observation[GoalView]
)
async def goal_view(store_binding_id: str, session_id: str, host: Host) -> Observation[GoalView]:
    """读取 Goal，不为历史构造 manager 或推进目标。"""
    binding = host.binding(store_binding_id)
    owner = host.owners.get((store_binding_id, session_id))
    if owner is not None:
        if not owner.generation.config.goal.enabled:
            return Observation(status="disabled", reason="Goal 未启用", data=None)
        view = await owner.manager.goal.get()
    else:
        saved = host.metadata.get("sessions", f"{store_binding_id}/{session_id}")
        if saved is not None and saved.get("goal_enabled") is False:
            return Observation(status="disabled", reason="Goal 未启用", data=None)
        view = GoalService(binding.store).get_view(session_id)
    return Observation(status="available", reason=None, data=view)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/goal/create", response_model=GoalReply
)
async def goal_create(
    store_binding_id: str, session_id: str, body: GoalCreateBody, host: Host
) -> GoalReply:
    """通过 exact manager 创建并允许推进。"""
    owner = _goal_owner(host, store_binding_id, session_id)
    async with owner.generation.admission:
        host.guard_admission(owner.generation)
        result = await owner.manager.goal.create(
            body.objective, max_rounds=body.max_rounds, run_options=body.run_options
        )
    return GoalReply(request_id=body.request_id, result=result)


@router.post("/stores/{store_binding_id}/sessions/{session_id}/goal/edit", response_model=GoalReply)
async def goal_edit(
    store_binding_id: str, session_id: str, body: GoalEditBody, host: Host
) -> GoalReply:
    """编辑保留原 SDK 的暂停语义。"""
    owner = _goal_owner(host, store_binding_id, session_id)
    result = await owner.manager.goal.edit(
        objective=body.objective, max_rounds=body.max_rounds, run_options=body.run_options
    )
    return GoalReply(request_id=body.request_id, result=result)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/goal/pause", response_model=GoalReply
)
async def goal_pause(
    store_binding_id: str, session_id: str, body: GoalReasonBody, host: Host
) -> GoalReply:
    """暂停后续目标运行，不取消当前 Run。"""
    result = await _goal_owner(host, store_binding_id, session_id).manager.goal.pause(
        reason=body.reason
    )
    return GoalReply(request_id=body.request_id, result=result)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/goal/complete", response_model=GoalReply
)
async def goal_complete(
    store_binding_id: str, session_id: str, body: GoalReasonBody, host: Host
) -> GoalReply:
    """显式完成目标。"""
    result = await _goal_owner(host, store_binding_id, session_id).manager.goal.complete(
        reason=body.reason
    )
    return GoalReply(request_id=body.request_id, result=result)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/goal/resume", response_model=GoalReply
)
async def goal_resume(
    store_binding_id: str, session_id: str, body: GoalResumeBody, host: Host
) -> GoalReply:
    """恢复仅当前 owner 的目标，并传递 activation fence。"""
    owner = _goal_owner(host, store_binding_id, session_id)
    async with owner.generation.admission:
        host.guard_admission(owner.generation)
        result = await owner.manager.goal.resume(expected_activation_id=body.expected_activation_id)
    return GoalReply(request_id=body.request_id, result=result)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/goal/clear", response_model=GoalReply
)
async def goal_clear(
    store_binding_id: str, session_id: str, body: RequestBody, host: Host
) -> GoalReply:
    """撤销目标选择，历史由 core 保留。"""
    result = await _goal_owner(host, store_binding_id, session_id).manager.goal.clear()
    return GoalReply(request_id=body.request_id, result=result)


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/todo",
    response_model=Observation[TodoSnapshot],
)
async def todo_view(
    store_binding_id: str, session_id: str, host: Host
) -> Observation[TodoSnapshot]:
    """读取当前 Markdown 唯一正文和原解析错误。"""
    owner = host.owners.get((store_binding_id, session_id))
    if owner is None:
        host.binding(store_binding_id)
        saved = host.metadata.get("sessions", f"{store_binding_id}/{session_id}")
        if saved is None:
            return Observation(status="not_collected", reason="此会话尚未登记 workspace", data=None)
        if saved.get("todo_enabled") is False:
            return Observation(status="disabled", reason="Todo 未启用", data=None)
        if saved.get("todo_enabled") is None or saved.get("workspace_root") is None:
            return Observation(
                status="not_collected", reason="此会话尚未登记 Todo 配置或 workspace", data=None
            )
        snapshot = await read_todo(Path(saved["workspace_root"]), session_id)
        return Observation(status="available", reason=None, data=snapshot)
    if not owner.generation.config.todo.enabled:
        return Observation(status="disabled", reason="Todo 未启用", data=None)
    return Observation(
        status="available", reason=None, data=await owner.generation.runner.get_todo(session_id)
    )


def _todo_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        return None


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/todo/document",
    response_model=Observation[TodoDocument],
)
async def todo_document(
    store_binding_id: str, session_id: str, host: Host
) -> Observation[TodoDocument]:
    """读取可编辑原文，不把格式错误变为空清单。"""
    view = await todo_view(store_binding_id, session_id, host)
    if view.data is None:
        return Observation(status=view.status, reason=view.reason, data=None)
    text = await asyncio.to_thread(_todo_text, view.data.path)
    return Observation(
        status="available",
        data=TodoDocument(path=str(view.data.path), text=text, snapshot=view.data),
    )


@router.put("/stores/{store_binding_id}/sessions/{session_id}/todo", response_model=TodoDocument)
async def todo_edit(
    store_binding_id: str, session_id: str, body: TodoEditBody, host: Host
) -> TodoDocument:
    """编辑已登记 workspace 的当前文件，保存后由原 SDK 解析。"""
    async with host.session_lock(store_binding_id, session_id):
        view = await todo_view(store_binding_id, session_id, host)
        if view.data is None:
            raise HostError(409, "CAPABILITY_DISABLED", view.reason or "Todo 不可用")
        path = view.data.path

        def save() -> None:
            current = _todo_text(path)
            if current != body.base_text:
                raise HostError(
                    409, "DOCUMENT_CONFLICT", "Todo 已被其他操作修改", {"current_text": current}
                )
            atomic_write_text(path, body.text)

        await asyncio.to_thread(save)
        updated = await todo_view(store_binding_id, session_id, host)
        return TodoDocument(path=str(path), text=body.text, snapshot=updated.data)


@router.get("/generations/{generation_id}/resources", response_model=ResourcesView)
def generation_resources(generation_id: str, host: Host) -> ResourcesView:
    """只返回已采用 generation 的实际资源。"""
    return ResourcesView(resources=host.generation(generation_id).resource_refs)


@router.get("/resources/{resource_id}/maintenance", response_model=MaintenanceView)
def maintenance_view(resource_id: str, host: Host) -> dict[str, Any]:
    """直接选择 coordinator snapshot，不推算调度或倒计时。"""
    resource = _resource(host, resource_id)
    if host.coordinator is None:
        raise HostError(409, "CAPABILITY_DISABLED", "维护协调器未启用")
    snapshot = host.coordinator.snapshot()
    view = next(
        (item for item in snapshot.resources if item.resource_ref == resource.ref.resource_ref),
        None,
    )
    if view is None:
        raise HostError(409, "CAPABILITY_DISABLED", "此资源未启用自动生成")
    return {
        "coordinator_id": snapshot.coordinator_id,
        "revision": snapshot.revision,
        "foreground_count": snapshot.foreground_count,
        "resource": view,
    }


@router.post(
    "/resources/{resource_id}/maintenance/memory-cycle",
    response_model=OperationAccepted,
    status_code=202,
)
async def request_memory_cycle(
    resource_id: str, body: RequestBody, host: Host
) -> OperationAccepted:
    """请求原协调器维护，HTTP 等待不拥有共享 worker。"""
    binding = _memory(host, resource_id)
    maintenance_view(resource_id, host)
    return host.operation(
        "maintenance", host.coordinator.request_memory_cycle(binding), request_id=body.request_id
    )


@router.post(
    "/resources/{resource_id}/maintenance/experience",
    response_model=OperationAccepted,
    status_code=202,
)
async def request_experience(resource_id: str, body: RequestBody, host: Host) -> OperationAccepted:
    """请求原协调器生成项目经验。"""
    binding = _evolution(host, resource_id)
    maintenance_view(resource_id, host)
    return host.operation(
        "maintenance",
        host.coordinator.request_project_experience(binding),
        request_id=body.request_id,
    )


@router.post(
    "/resources/{resource_id}/maintenance/revision",
    response_model=OperationAccepted,
    status_code=202,
)
async def request_revision(resource_id: str, body: RevisionBody, host: Host) -> OperationAccepted:
    """由领域 owner 保存修订请求并等待其自身结算。"""
    binding = _evolution(host, resource_id)
    maintenance_view(resource_id, host)
    session = None
    if body.session is not None:
        store = host.binding(body.session.store_binding_id).store
        _found(store.load_session_header(body.session.session_id))
        if store.source_id != body.session.source_id:
            raise HostError(409, "SOURCE_CONFLICT", "会话来源与 storage binding 不一致")
        session = EvolutionSession(
            lifecycle_source_id=store.source_id, session_id=body.session.session_id
        )
    request = RevisionRequest(description=body.description, targets=body.targets, session=session)
    return host.operation(
        "maintenance",
        host.coordinator.request_revision(binding, request),
        request_id=body.request_id,
    )


@router.get("/resources/{resource_id}/memory/generation", response_model=GenerationState)
async def memory_generation(resource_id: str, host: Host) -> GenerationState:
    """读取实际生成积压。"""
    binding = _memory(host, resource_id)
    return await binding.service.ageneration_state(binding.namespace)


@router.get("/resources/{resource_id}/memory/items", response_model=Items[MemoryItem])
async def memory_items(
    resource_id: str,
    host: Host,
    limit: int = 50,
    categories: Annotated[list[MemoryCategory] | None, Query()] = None,
    kinds: Annotated[list[MemoryItemKind] | None, Query()] = None,
) -> Items[MemoryItem]:
    """读取 namespace 活跃条目，不将其归给当前 Run。"""
    binding = _memory(host, resource_id)
    return Items(
        items=await binding.service.alist_items(
            [binding.namespace], limit=limit, categories=categories, kinds=kinds
        )
    )


@router.get("/resources/{resource_id}/memory/items/{item_id}", response_model=MemoryItem)
async def memory_item(resource_id: str, item_id: str, host: Host) -> MemoryItem:
    """读取 exact namespace 的单条记忆。"""
    binding = _memory(host, resource_id)
    return _found(await binding.service.aget_item(item_id, [binding.namespace]))


@router.get("/resources/{resource_id}/memory/events", response_model=Items[MemoryEvent])
async def memory_events(
    resource_id: str, host: Host, item_id: str | None = None, limit: int = 100
) -> Items[MemoryEvent]:
    """读取原记忆事件。"""
    binding = _memory(host, resource_id)
    return Items(
        items=await binding.service.alist_events(binding.namespace, item_id=item_id, limit=limit)
    )


@router.get(
    "/resources/{resource_id}/memory/overviews", response_model=Items[MemoryOverviewDocument]
)
async def memory_overviews(resource_id: str, host: Host) -> Items[MemoryOverviewDocument]:
    """读取实际概览投影及版本提示。"""
    binding = _memory(host, resource_id)
    return Items(items=await binding.service.aload_overviews([binding.namespace]))


@router.get("/resources/{resource_id}/memory/episodes", response_model=Page[MemoryEpisode])
async def memory_episodes(
    resource_id: str, host: Host, after: str | None = None, limit: int = 50
) -> Page[MemoryEpisode]:
    """分页包括已经消费的经历。"""
    binding = _memory(host, resource_id)
    return _page(
        await binding.service.alist_episodes(
            binding.namespace, after=_cursor(after, MemoryHistoryCursor), limit=limit
        )
    )


@router.get("/resources/{resource_id}/memory/episodes/{episode_id}", response_model=MemoryEpisode)
async def memory_episode(resource_id: str, episode_id: str, host: Host) -> MemoryEpisode:
    """通过公开 store 和服务线程策略读取经历原文。"""
    binding = _memory(host, resource_id)
    return _found(
        await binding.service.run_async_io(
            partial(binding.service.store.get_episode, episode_id, binding.namespace)
        )
    )


@router.get("/resources/{resource_id}/memory/observations", response_model=Items[ObservationState])
async def memory_observations(
    resource_id: str, host: Host, status: str | None = None, limit: int = 100
) -> Items[ObservationState]:
    """读取原观察及当前处理状态。"""
    binding = _memory(host, resource_id)
    return Items(
        items=await binding.service.run_async_io(
            partial(
                binding.service.store.list_observations,
                binding.namespace,
                status=status,
                limit=limit,
            )
        )
    )


@router.get(
    "/resources/{resource_id}/memory/observations/{observation_id}", response_model=ObservationState
)
async def memory_observation(resource_id: str, observation_id: str, host: Host) -> ObservationState:
    """读取单条观察，不由 Item 反推历史。"""
    binding = _memory(host, resource_id)
    return _found(await binding.service.aget_observation(binding.namespace, observation_id))


@router.get(
    "/resources/{resource_id}/memory/generation-results", response_model=Page[GenerationResult]
)
async def memory_generation_results(
    resource_id: str, host: Host, after: str | None = None, limit: int = 50
) -> Page[GenerationResult]:
    """读取完整阶段历史，包含失败和空结果。"""
    binding = _memory(host, resource_id)
    return _page(
        await binding.service.alist_generation_results(
            binding.namespace, after=_cursor(after, MemoryHistoryCursor), limit=limit
        )
    )


@router.get(
    "/resources/{resource_id}/memory/publications", response_model=Page[MemoryPublicationRecord]
)
async def memory_publications(
    resource_id: str, host: Host, after: str | None = None, limit: int = 50
) -> Page[MemoryPublicationRecord]:
    """分页读取原发布 owner 保存的文件版本。"""
    binding = _memory(host, resource_id)
    return _page(
        await binding.service.alist_publications(
            binding.namespace, after=_cursor(after, MemoryHistoryCursor), limit=limit
        )
    )


@router.get(
    "/resources/{resource_id}/memory/publications/{publication_id}",
    response_model=MemoryPublicationRecord,
)
async def memory_publication(
    resource_id: str, publication_id: str, host: Host
) -> MemoryPublicationRecord:
    """只显示当时发布的文档。"""
    binding = _memory(host, resource_id)
    return _found(await binding.service.aget_publication(binding.namespace, publication_id))


@router.get("/resources/{resource_id}/evolution/sources", response_model=EvolutionSources)
async def evolution_sources(resource_id: str, host: Host) -> EvolutionSources:
    """读取待处理来源短投影。"""
    service = _evolution(host, resource_id).service
    return EvolutionSources(
        pending_sources=await service.alist_pending_sources(),
        pending_sessions=await service.alist_pending_sessions(),
    )


@router.get("/resources/{resource_id}/evolution/skill", response_model=Observation[SkillDocument])
async def evolution_skill(resource_id: str, host: Host) -> Observation[SkillDocument]:
    """读取当前项目经验；不冒充历史发布正文。"""
    service = _evolution(host, resource_id).service
    try:
        text = await service.run_async_io(partial(service.skill_path.read_text, encoding="utf-8"))
    except FileNotFoundError:
        return Observation(status="not_triggered", reason="尚未生成项目经验", data=None)
    return Observation(
        status="available",
        reason=None,
        data=SkillDocument(file_path=str(service.skill_path), text=text),
    )


@router.get(
    "/resources/{resource_id}/evolution/requests", response_model=Page[RevisionRequestSummary]
)
async def evolution_requests(
    resource_id: str, host: Host, after: str | None = None, limit: int = 50
) -> Page[RevisionRequestSummary]:
    """请求列表只取摘要。"""
    return _page(
        await _evolution(host, resource_id).service.alist_revision_requests(
            after=_cursor(after, EvolutionHistoryCursor), limit=limit
        )
    )


@router.get(
    "/resources/{resource_id}/evolution/requests/{revision_id}", response_model=RevisionItem
)
async def evolution_request(resource_id: str, revision_id: str, host: Host) -> RevisionItem:
    """读取原请求及不可变 evidence。"""
    return _found(await _evolution(host, resource_id).service.aget_revision_request(revision_id))


@router.get(
    "/resources/{resource_id}/evolution/revisions/{revision_id}/result",
    response_model=Observation[EvolutionResult],
)
async def evolution_result(
    resource_id: str, revision_id: str, host: Host
) -> Observation[EvolutionResult]:
    """pending 请求没有最终结果，不合成空成功。"""
    service = _evolution(host, resource_id).service
    _found(await service.aget_revision_request(revision_id))
    result = await service.run_async_io(partial(service.store.revision_result, revision_id))
    return Observation(
        status="not_triggered" if result is None else "available",
        reason="修订尚未结算" if result is None else None,
        data=result,
    )


@router.get(
    "/resources/{resource_id}/evolution/publications", response_model=Page[PublicationSummary]
)
async def evolution_publications(
    resource_id: str, host: Host, after: str | None = None, limit: int = 50
) -> Page[PublicationSummary]:
    """按 SDK 摘要分页，不提前抓取详情。"""
    return _page(
        await _evolution(host, resource_id).service.alist_publications(
            after=_cursor(after, EvolutionHistoryCursor), limit=limit
        )
    )


@router.get(
    "/resources/{resource_id}/evolution/publications/{publication_id}",
    response_model=PublicationHistoryEntry,
)
async def evolution_publication(
    resource_id: str, publication_id: str, host: Host
) -> PublicationHistoryEntry:
    """expired 仍是存在的记录，保留 summary 与必要 evidence。"""
    return _found(await _evolution(host, resource_id).service.aget_publication(publication_id))
