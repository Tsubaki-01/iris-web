"""订阅登记后发送 ready；SSE 断线只关闭观察。"""

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends, Header
from fastapi.responses import StreamingResponse
from iris.streaming import (
    GatewaySubscription,
    LiveStreamBroker,
    LiveSubscriptionRequest,
    SSEAdapter,
    SubscribeCommand,
    decode_live_cursor,
)
from pydantic import ValidationError

from .contracts import HostError, StreamReady
from .dependencies import get_host
from .resources import StudioHost, identifier

router = APIRouter(prefix="/api", tags=["streaming"])
Host = Annotated[StudioHost, Depends(get_host)]


def subscribe(
    host: StudioHost, broker: LiveStreamBroker, ready: StreamReady, cursor: str | None
) -> AsyncIterator[bytes]:
    """同步登记 broker 后才返回网络 iterator。"""
    try:
        decoded = decode_live_cursor(cursor) if cursor else None
    except (ValueError, ValidationError) as exc:
        raise HostError(422, "INVALID_CURSOR", "Live cursor 无效") from exc
    if decoded is not None and (decoded.scope != ready.scope or decoded.scope_id != ready.scope_id):
        raise HostError(409, "CURSOR_SCOPE_MISMATCH", "Live cursor 不属于当前订阅")
    if decoded is not None and decoded.stream_epoch != broker.current_epoch():
        other_epochs = {
            item.broker.current_epoch()
            for item in host.bindings.values()
            if item.broker is not broker
        }
        if host.resource_broker is not broker:
            other_epochs.add(host.resource_broker.current_epoch())
        if decoded.stream_epoch in other_epochs:
            raise HostError(409, "CURSOR_SCOPE_MISMATCH", "Live cursor 属于其它存储绑定")
    request = LiveSubscriptionRequest(scope=ready.scope, scope_id=ready.scope_id, cursor=decoded)
    subscription = broker.subscribe(request)
    gateway = GatewaySubscription(
        subscription=subscription,
        stream_epoch=broker.current_epoch(),
        request=SubscribeCommand(
            request_id=ready.connection_id,
            scope=ready.scope,
            scope_id=ready.scope_id,
            cursor=decoded,
        ),
        initial_sync=None,
        allow_thinking=True,
        allow_tool_arguments=True,
    )

    async def frames() -> AsyncIterator[bytes]:
        try:
            yield f"event: stream.ready\ndata: {ready.model_dump_json()}\n\n".encode()
            async for frame in SSEAdapter(heartbeat_interval_s=15).stream(gateway):
                yield frame
        finally:
            await gateway.aclose()

    return frames()


@router.get("/stores/{store_binding_id}/sessions/{session_id}/stream")
async def session_stream(
    store_binding_id: str,
    session_id: str,
    host: Host,
    cursor: str | None = None,
    last_event_id: Annotated[str | None, Header()] = None,
) -> StreamingResponse:
    """根 session_tree 订阅保留真实 child identity。"""
    host.session_view(store_binding_id, session_id)
    binding = host.binding(store_binding_id)
    ready = StreamReady(
        connection_id=identifier("connection"),
        backend_epoch=host.backend_epoch,
        store_binding_id=store_binding_id,
        source_id=binding.source_id,
        resource_id=None,
        stream_epoch=binding.broker.current_epoch(),
        scope="session_tree",
        scope_id=session_id,
    )
    return StreamingResponse(
        subscribe(host, binding.broker, ready, last_event_id or cursor),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/resources/{resource_id}/stream")
async def resource_stream(
    resource_id: str,
    host: Host,
    cursor: str | None = None,
    last_event_id: Annotated[str | None, Header()] = None,
) -> StreamingResponse:
    """维护 scope 与聊天 scope 分离。"""
    resource = host.resources.get(resource_id)
    if resource is None:
        raise HostError(404, "RESOURCE_NOT_FOUND", "学习资源不存在")
    ready = StreamReady(
        connection_id=identifier("connection"),
        backend_epoch=host.backend_epoch,
        store_binding_id=None,
        source_id=None,
        resource_id=resource_id,
        stream_epoch=host.resource_broker.current_epoch(),
        scope="resource",
        scope_id=resource.ref.resource_ref,
    )
    return StreamingResponse(
        subscribe(host, host.resource_broker, ready, last_event_id or cursor),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
