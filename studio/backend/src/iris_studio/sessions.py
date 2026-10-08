"""会话控制薄路由；所有持久事实来自确切 Iris store。"""

from __future__ import annotations

import asyncio
import base64
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from iris.harness import (
    RestoreReceipt,
    ResumeReceipt,
    SessionControlSnapshot,
    SessionHistory,
    SubmitReceipt,
)
from iris.hitl import HumanInteractionResponse
from iris.lifecycle import (
    ChildRunSummary,
    ForkPoint,
    ForkPointCursor,
    RunCursor,
    RunEvent,
    RunResult,
    RunSnapshot,
    SessionCursor,
    SessionSummary,
    snapshot_run,
)
from iris.streaming import DurableRunCursor
from pydantic import TypeAdapter, ValidationError

from .contracts import (
    DTO,
    GenerationView,
    HostError,
    Page,
    RequestId,
    RunRef,
    SessionRef,
    SessionView,
    SubmitInput,
)
from .dependencies import get_host
from .files import project_message, project_tool, resolve_input_images
from .media_models import UiMessage, UiToolCall
from .resources import Generation, SessionOwner, StudioHost, identifier

router = APIRouter(prefix="/api", tags=["sessions"])
Host = Annotated[StudioHost, Depends(get_host)]


def decode_cursor[T](value: str | None, cursor_type: type[T]) -> T | None:
    """HTTP raw boundary 只解析一次领域游标。"""
    if value is None:
        return None
    try:
        return TypeAdapter(cursor_type).validate_json(base64.urlsafe_b64decode(value))
    except (ValueError, ValidationError) as exc:
        raise HostError(422, "INVALID_CURSOR", "分页游标无效") from exc


def encode_cursor(value: Any | None) -> str | None:
    """序列化领域返回的可信游标。"""
    if value is None:
        return None
    return base64.urlsafe_b64encode(TypeAdapter(type(value)).dump_json(value)).decode()


class CreateSessionInput(RequestId):
    """选择具体实例建立空会话。"""

    generation_id: str
    title: str | None = None


class TitleInput(DTO):
    """主机标题变更。"""

    title: str


class MessagePage(DTO):
    """绝对消息位置是浏览器去重身份。"""

    items: list[UiMessage]
    next_index: int | None
    total_count: int


class RunView(DTO):
    """完整运行、结果与工具投影。"""

    ref: RunRef
    run: RunSnapshot
    result: RunResult | None
    tool_calls: list[UiToolCall]


class LaneView(DTO):
    """当前非终态持久 lane，与 manager 是否存在独立。"""

    session: SessionRef
    run_id: str | None
    run: RunSnapshot | None


class Watermark(DTO):
    """事实水位，不代表客户端已消费。"""

    run_id: str
    last_event_sequence: int


class SessionBootstrap(DTO):
    """订阅 ready 后读取的有界独立事实集合。"""

    session: SessionView
    control: SessionControlSnapshot | None
    lane: LaneView
    current_run: RunView | None
    messages: MessagePage
    event_watermarks: list[Watermark]


class ControlView(DTO):
    """未接管历史的 control 明确为空。"""

    control: SessionControlSnapshot | None


class EventsPage(DTO):
    """精确运行事件页。"""

    events: list[RunEvent]
    next_cursor: DurableRunCursor | None


class SubmissionAccepted(DTO):
    """输入已准入，不代表 Run 成功。"""

    request_id: str
    receipt: SubmitReceipt


class InteractionInput(RequestId):
    """当前 Iris typed HITL response。"""

    response: HumanInteractionResponse


class ResumeAccepted(DTO):
    """人工响应准入回执。"""

    request_id: str
    receipt: ResumeReceipt


class InterruptInput(RequestId):
    """显式请求取消或停止自动目标推进。"""

    reason: str | None = None


class InterruptReceipt(DTO):
    """取消后真实快照。"""

    run: RunSnapshot | None


class InterruptAccepted(DTO):
    """取消请求已被处理。"""

    request_id: str
    receipt: InterruptReceipt


class AttachInput(RequestId):
    """选择继续历史使用的实例。"""

    generation_id: str


class AttachResult(DTO):
    """绑定后可继续输入，不触发模型。"""

    request_id: str
    session: SessionView
    generation: GenerationView
    control: SessionControlSnapshot


class RestoreInput(AttachInput):
    """显式恢复 Run 与 activation fence。"""

    run_id: str
    expected_activation_id: str | None = None


class RestoreAccepted(DTO):
    """实际接管实例及领域恢复回执。"""

    request_id: str
    generation_id: str
    receipt: RestoreReceipt


class RunHistory(DTO):
    """真实分支点末尾的历史前缀。"""

    point: ForkPoint
    messages: list[UiMessage]


class StoreSessions(DTO):
    """workspace 内各存储独立分页。"""

    store_binding_id: str
    source_id: str
    page: Page[SessionSummary]


class WorkspaceSessions(DTO):
    """分库存量与尚未执行的主机草稿。"""

    stores: list[StoreSessions]
    drafts: list[SessionView]


def read_run(host: StudioHost, store_binding_id: str, run_id: str) -> RunView:
    """从完整 store records 投影，不使用 gateway 精简副本。"""
    binding = host.binding(store_binding_id)
    record = binding.store.load_run(run_id)
    if record is None:
        raise HostError(404, "RUN_NOT_FOUND", "运行不存在")
    return RunView(
        ref=RunRef(store_binding_id=store_binding_id, source_id=binding.source_id, run_id=run_id),
        run=snapshot_run(record),
        result=binding.store.load_result(run_id),
        tool_calls=[
            project_tool(host, store_binding_id, item)
            for item in binding.store.list_tool_calls(run_id)
        ],
    )


def read_lane(host: StudioHost, store_binding_id: str, session_id: str) -> LaneView:
    """读取 lane，不创建 manager。"""
    binding = host.binding(store_binding_id)
    session = host.session_view(store_binding_id, session_id)
    run_id = binding.store.load_session_lane(session_id)
    record = binding.store.load_run(run_id) if run_id is not None else None
    return LaneView(
        session=session.ref,
        run_id=run_id,
        run=snapshot_run(record) if record is not None else None,
    )


def read_messages(
    host: StudioHost, store_binding_id: str, session_id: str, start: int, limit: int
) -> MessagePage:
    """保留绝对 ordinal 的消息页。"""
    page = host.binding(store_binding_id).store.read_session_messages(
        session_id, start=start, limit=limit
    )
    return MessagePage(
        items=[
            project_message(host, store_binding_id, session_id, ordinal, message)
            for ordinal, message in page.items
        ],
        next_index=page.next_index,
        total_count=page.total_count,
    )


async def retained(host: StudioHost, awaitable: Any) -> Any:
    """准入命令由 host 持有，HTTP 取消只停止等待。"""
    task = asyncio.create_task(awaitable)
    host.tasks.add(task)
    task.add_done_callback(host.tasks.discard)
    return await asyncio.shield(task)


@router.get("/workspaces/{workspace_id}/sessions", response_model=WorkspaceSessions)
async def workspace_sessions(
    workspace_id: str,
    host: Host,
    cursors: str | None = None,
    limit_per_store: int = Query(50, gt=0),
) -> WorkspaceSessions:
    """按 workspace 的 profile/store 关联独立分页。"""
    import json
    from json import JSONDecodeError

    try:
        positions = (
            {}
            if cursors is None
            else TypeAdapter(dict[str, str]).validate_python(json.loads(cursors))
        )
    except (JSONDecodeError, ValidationError) as exc:
        raise HostError(422, "INVALID_CURSOR", "分库存储游标映射无效") from exc
    profiles = {
        item["profile_id"]
        for item in host.metadata.list("profiles")
        if item["workspace_id"] == workspace_id
    }
    store_binding_ids = {
        item["store_binding_id"]
        for item in host.metadata.list("generations")
        if item["profile_id"] in profiles and item["store_binding_id"] in host.bindings
    }
    stores = []
    drafts = []
    for store_binding_id in sorted(store_binding_ids):
        binding = host.binding(store_binding_id)
        page = binding.store.list_sessions(
            after=decode_cursor(positions.get(store_binding_id), SessionCursor),
            limit=limit_per_store,
        )
        for item in page.items:
            host.remember_session(store_binding_id, item.session_id, item.forked_from_run_id)
        stores.append(
            StoreSessions(
                store_binding_id=store_binding_id,
                source_id=binding.source_id,
                page=Page(items=list(page.items), next_cursor=encode_cursor(page.next_cursor)),
            )
        )
    for item in host.metadata.list("sessions"):
        if item.get("profile_id") in profiles and item["store_binding_id"] in host.bindings:
            view = host.session_view(item["store_binding_id"], item["session_id"])
            if not view.has_durable_state:
                drafts.append(view)
    return WorkspaceSessions(stores=stores, drafts=drafts)


@router.get("/stores/{store_binding_id}/sessions", response_model=Page[SessionSummary])
async def sessions(
    store_binding_id: str, host: Host, after: str | None = None, limit: int = Query(50, gt=0)
) -> Page[SessionSummary]:
    """直接传递分页到 store 唯一 owner。"""
    page = host.binding(store_binding_id).store.list_sessions(
        after=decode_cursor(after, SessionCursor), limit=limit
    )
    for item in page.items:
        host.remember_session(store_binding_id, item.session_id, item.forked_from_run_id)
    return Page(items=list(page.items), next_cursor=encode_cursor(page.next_cursor))


@router.post("/stores/{store_binding_id}/sessions", response_model=SessionView, status_code=201)
async def create_session(
    store_binding_id: str, body: CreateSessionInput, host: Host
) -> SessionView:
    """预留会话，第一次 submit 才创建持久 Run。"""
    generation = host.generation(body.generation_id)
    async with generation.admission:
        host.guard_admission(generation)
        if generation.binding is not host.binding(store_binding_id):
            raise HostError(409, "STORE_MISMATCH", "新会话必须使用实例实际存储")
        session_id = identifier("session")
        host.register_session(generation, session_id, body.title or "新会话")
    return host.session_view(store_binding_id, session_id)


@router.get("/stores/{store_binding_id}/sessions/{session_id}", response_model=SessionView)
async def session(store_binding_id: str, session_id: str, host: Host) -> SessionView:
    """读取会话身份。"""
    return host.session_view(store_binding_id, session_id)


@router.patch("/stores/{store_binding_id}/sessions/{session_id}", response_model=SessionView)
async def title(
    store_binding_id: str, session_id: str, body: TitleInput, host: Host
) -> SessionView:
    """只修改主机标题。"""
    view = host.session_view(store_binding_id, session_id)
    key = f"{store_binding_id}/{session_id}"
    saved = host.metadata.get("sessions", key) or {
        "store_binding_id": store_binding_id,
        "session_id": session_id,
        "forked_from_run_id": view.forked_from_run_id,
    }
    saved["title"] = body.title
    host.metadata.put("sessions", key, saved)
    return host.session_view(store_binding_id, session_id)


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/bootstrap", response_model=SessionBootstrap
)
async def bootstrap(
    store_binding_id: str, session_id: str, host: Host, message_limit: int = Query(100, gt=0)
) -> SessionBootstrap:
    """有界历史快照；各读取有自己的水位。"""
    view = host.session_view(store_binding_id, session_id)
    owner = host.owners.get((store_binding_id, session_id))
    lane = read_lane(host, store_binding_id, session_id)
    current = read_run(host, store_binding_id, lane.run_id) if lane.run_id else None
    count = host.binding(store_binding_id).store.load_session_header(session_id).message_count
    return SessionBootstrap(
        session=view,
        control=owner.manager.snapshot() if owner else None,
        lane=lane,
        current_run=current,
        messages=read_messages(
            host, store_binding_id, session_id, max(0, count - message_limit), message_limit
        ),
        event_watermarks=[]
        if current is None
        else [
            Watermark(
                run_id=current.run.run_id, last_event_sequence=current.run.last_event_sequence
            )
        ],
    )


@router.get("/stores/{store_binding_id}/sessions/{session_id}/control", response_model=ControlView)
async def control(store_binding_id: str, session_id: str, host: Host) -> ControlView:
    """不为纯 GET 创建 manager。"""
    host.session_view(store_binding_id, session_id)
    owner = host.owners.get((store_binding_id, session_id))
    return ControlView(control=owner.manager.snapshot() if owner else None)


@router.get("/stores/{store_binding_id}/sessions/{session_id}/lane", response_model=LaneView)
async def lane(store_binding_id: str, session_id: str, host: Host) -> LaneView:
    """读取非终态运行 lane。"""
    return read_lane(host, store_binding_id, session_id)


@router.get("/stores/{store_binding_id}/sessions/{session_id}/messages", response_model=MessagePage)
async def messages(
    store_binding_id: str,
    session_id: str,
    host: Host,
    start: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
) -> MessagePage:
    """有界读取持久消息。"""
    host.session_view(store_binding_id, session_id)
    return read_messages(host, store_binding_id, session_id, start, limit)


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/runs", response_model=Page[RunSnapshot]
)
async def runs(
    store_binding_id: str,
    session_id: str,
    host: Host,
    after: str | None = None,
    limit: int = Query(50, gt=0),
) -> Page[RunSnapshot]:
    """列出全部 phase，沿 SDK RunCursor。"""
    host.session_view(store_binding_id, session_id)
    page = host.binding(store_binding_id).store.list_runs(
        session_id, after=decode_cursor(after, RunCursor), limit=limit
    )
    return Page(items=list(page.items), next_cursor=encode_cursor(page.next_cursor))


@router.get("/stores/{store_binding_id}/runs/{run_id}/snapshot", response_model=RunView)
async def run(store_binding_id: str, run_id: str, host: Host) -> RunView:
    """完整运行投影。"""
    return read_run(host, store_binding_id, run_id)


@router.get("/stores/{store_binding_id}/runs/{run_id}/events", response_model=EventsPage)
async def events(
    store_binding_id: str,
    run_id: str,
    host: Host,
    after_sequence: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
) -> EventsPage:
    """按自己已消费到的 durable sequence 补读。"""
    binding = host.binding(store_binding_id)
    if binding.store.load_run(run_id) is None:
        raise HostError(404, "RUN_NOT_FOUND", "运行不存在")
    items = binding.store.list_events(run_id, after_sequence, limit=limit)
    return EventsPage(
        events=items,
        next_cursor=DurableRunCursor(run_id=run_id, after_sequence=items[-1].sequence)
        if len(items) == limit
        else None,
    )


@router.get(
    "/stores/{store_binding_id}/runs/{run_id}/children", response_model=Page[ChildRunSummary]
)
async def children(
    store_binding_id: str,
    run_id: str,
    host: Host,
    after: str | None = None,
    limit: int = Query(50, gt=0),
) -> Page[ChildRunSummary]:
    """读取直接 child，后代继续按真实 parent 查询。"""
    page = host.binding(store_binding_id).store.list_child_runs(
        run_id, after=decode_cursor(after, RunCursor), limit=limit
    )
    return Page(items=list(page.items), next_cursor=encode_cursor(page.next_cursor))


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/inputs",
    response_model=SubmissionAccepted,
    status_code=202,
)
async def inputs(
    store_binding_id: str, session_id: str, body: SubmitInput, host: Host
) -> SubmissionAccepted:
    """输入和退役共用准入锁，manager 决定投递语义。"""

    async def submit() -> SubmitReceipt:
        async with host.session_lock(store_binding_id, session_id):
            owner = host.owner(store_binding_id, session_id)
            async with owner.generation.admission:
                host.guard_admission(owner.generation)
                value = resolve_input_images(host, store_binding_id, session_id, body.input)
                return await owner.manager.submit(value, mode=body.mode, options=body.options)

    return SubmissionAccepted(
        request_id=body.request_id or identifier("request"), receipt=await retained(host, submit())
    )


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/interactions/{interaction_id}/response",
    response_model=ResumeAccepted,
    status_code=202,
)
async def respond(
    store_binding_id: str, session_id: str, interaction_id: str, body: InteractionInput, host: Host
) -> ResumeAccepted:
    """既有 HITL 在退役期间仍可收口。"""
    owner = host.owner(store_binding_id, session_id)
    receipt = await retained(
        host, owner.manager.admit_resume(interaction_id=interaction_id, response=body.response)
    )
    return ResumeAccepted(request_id=body.request_id or identifier("request"), receipt=receipt)


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/interrupt",
    response_model=InterruptAccepted,
    status_code=202,
)
async def interrupt(
    store_binding_id: str, session_id: str, body: InterruptInput, host: Host
) -> InterruptAccepted:
    """取消请求不冒充终态。"""
    owner = host.owner(store_binding_id, session_id)
    result = await retained(host, owner.manager.interrupt(reason=body.reason))
    return InterruptAccepted(
        request_id=body.request_id or identifier("request"), receipt=InterruptReceipt(run=result)
    )


async def select_owner(
    host: StudioHost, store_binding_id: str, session_id: str, selected: Generation
) -> SessionOwner:
    """已持有 session 锁，先查现有 owner 再构造恢复实例。"""
    existing = host.owners.get((store_binding_id, session_id))
    if existing is not None:
        source = existing.generation.recovery_source
        if existing.generation is not selected and (
            source is None or source.selected_generation_id != selected.generation_id
        ):
            raise HostError(409, "SESSION_GENERATION_IN_USE", "会话已有其它实例 owner")
        return existing
    generation = await host.recover_generation(selected, host.binding(store_binding_id))
    session = host.session_view(store_binding_id, session_id)
    return host.register_session(
        generation, session_id, session.title, forked_from_run_id=session.forked_from_run_id
    )


@router.post("/stores/{store_binding_id}/sessions/{session_id}/attach", response_model=AttachResult)
async def attach(
    store_binding_id: str, session_id: str, body: AttachInput, host: Host
) -> AttachResult:
    """只绑定无 lane 历史，绝不偷调 restore。"""
    async with host.session_lock(store_binding_id, session_id):
        selected = host.generation(body.generation_id)
        async with selected.admission:
            host.guard_admission(selected)
            host.session_view(store_binding_id, session_id)
            lane_id = host.binding(store_binding_id).store.load_session_lane(session_id)
            if lane_id is not None:
                raise HostError(
                    409, "SESSION_REQUIRES_RESTORE", "当前会话存在未收口运行", {"run_id": lane_id}
                )
            owner = await select_owner(host, store_binding_id, session_id, selected)
    return AttachResult(
        request_id=body.request_id or identifier("request"),
        session=host.session_view(store_binding_id, session_id),
        generation=owner.generation.view(),
        control=owner.manager.snapshot(),
    )


@router.post(
    "/stores/{store_binding_id}/sessions/{session_id}/restore",
    response_model=RestoreAccepted,
    status_code=202,
)
async def restore(
    store_binding_id: str, session_id: str, body: RestoreInput, host: Host
) -> RestoreAccepted:
    """先校验 exact run/session，再由现有 SDK 裁决恢复。"""

    async def recover() -> RestoreAccepted:
        async with host.session_lock(store_binding_id, session_id):
            selected = host.generation(body.generation_id)
            async with selected.admission:
                record = read_run(host, store_binding_id, body.run_id)
                if record.run.session_id != session_id:
                    raise HostError(409, "RUN_SESSION_MISMATCH", "运行不属于当前会话")
                owner = await select_owner(host, store_binding_id, session_id, selected)
                receipt = await owner.manager.restore(
                    body.run_id, expected_activation_id=body.expected_activation_id
                )
                return RestoreAccepted(
                    request_id=body.request_id or identifier("request"),
                    generation_id=owner.generation.generation_id,
                    receipt=receipt,
                )

    return await retained(host, recover())


@router.get(
    "/stores/{store_binding_id}/sessions/{session_id}/fork-points", response_model=Page[ForkPoint]
)
async def fork_points(
    store_binding_id: str,
    session_id: str,
    host: Host,
    after: str | None = None,
    limit: int = Query(50, gt=0),
) -> Page[ForkPoint]:
    """由历史领域筛选真实可分支点。"""
    page = SessionHistory(host.binding(store_binding_id).store).list_fork_points(
        session_id, after=decode_cursor(after, ForkPointCursor), limit=limit
    )
    return Page(items=list(page.items), next_cursor=encode_cursor(page.next_cursor))


@router.get("/stores/{store_binding_id}/runs/{run_id}/history", response_model=RunHistory)
async def history(store_binding_id: str, run_id: str, host: Host) -> RunHistory:
    """分支点的历史消息前缀。"""
    result = SessionHistory(host.binding(store_binding_id).store).get_at_run(run_id)
    return RunHistory(
        point=result.point,
        messages=[
            project_message(host, store_binding_id, result.point.session_id, index, message)
            for index, message in enumerate(result.messages)
        ],
    )


@router.post(
    "/stores/{store_binding_id}/runs/{run_id}/fork", response_model=SessionView, status_code=201
)
async def fork(
    store_binding_id: str, run_id: str, body: CreateSessionInput, host: Host
) -> SessionView:
    """只复制已提交历史，不回放任何工具。"""
    generation = host.generation(body.generation_id)
    async with generation.admission:
        host.guard_admission(generation)
        binding = host.binding(store_binding_id)
        if binding is not generation.binding:
            raise HostError(409, "STORE_MISMATCH", "分支必须使用同一个存储")
        created = SessionHistory(binding.store).fork(run_id)
        host.register_session(
            generation, created.session_id, body.title or "会话分支", forked_from_run_id=run_id
        )
    return host.session_view(store_binding_id, created.session_id)
