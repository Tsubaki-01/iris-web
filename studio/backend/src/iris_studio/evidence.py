"""原 typed facts 与标准 OTel span 的只读证据存储，不拥有运行状态。"""

from __future__ import annotations

import json
import sqlite3
from collections.abc import Sequence
from datetime import UTC, datetime
from threading import RLock
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from iris.harness.configuration import ConfigurationApplied, EffectiveConfiguration
from iris.harness.streaming import LineagedLiveFact, LiveFact, LivePublisher
from iris.observability.facts import SourceAdopted
from iris.runtime import RuntimeStreamEvent
from iris.runtime.diagnostics import ContextPreparation
from opentelemetry.sdk.trace import ReadableSpan
from opentelemetry.sdk.trace.export import SpanExporter, SpanExportResult
from pydantic import BaseModel, Field, TypeAdapter

from .contracts import HostError, Observation, Page, ResourceRef, RunRef
from .dependencies import get_host

router = APIRouter(prefix="/api", tags=["evidence"])
Host = Annotated[Any, Depends(get_host)]


class ContextPreparationSummary(BaseModel):
    """上下文列表只投影实际准备事实的短字段。"""

    preparation_id: str
    run_id: str
    activation_id: str
    step_index: int
    phase: str
    final_input_tokens: int | None = None


class ModelStreamLink(BaseModel):
    """Runtime 原事件确认的模型流与步骤关联。"""

    run_id: str
    activation_id: str
    step_index: int
    model_stream_id: str
    preparation_id: str | None


class ModelCallSummary(BaseModel):
    """真实模型 span 的身份、时间和已报告用量。"""

    record_id: str
    source: RunRef | ResourceRef | None
    trace_id: str
    span_id: str
    parent_span_id: str | None
    activation_id: str | None = None
    step_index: int | None = None
    purpose: str | None = None
    model_stream_id: str | None = None
    started_at: datetime
    ended_at: datetime
    outcome: str
    request_model: str | None = None
    response_model: str | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    preparation_id: str | None = None
    configuration_snapshot_id: str | None = None


class ModelCallRecord(BaseModel):
    """原 span 属性、事件以及完整内容与截断预览的不同状态。"""

    summary: ModelCallSummary
    attributes: dict[str, Any]
    events: list[dict[str, Any]]
    input: Observation[Any]
    output: Observation[Any]
    tool_definitions: Observation[Any]
    truncated_fields: list[str]
    previews: dict[str, Any]


class EvidenceStatus(BaseModel):
    """证据写入状态独立于领域执行结果。"""

    recording_enabled: bool
    pending_writes: int
    write_error: str | None


class EvidenceItems[T](BaseModel):
    """当前运行的一类已保存证据。"""

    items: list[T]


def _json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def _typed(value: Any) -> Any:
    return TypeAdapter(type(value)).dump_python(value, mode="json")


class EvidenceRecorder:
    """同步接纳并提交观察事实，通知发出时详情已经可读。"""

    def __init__(self, metadata: Any) -> None:
        self.path = metadata.path.with_name("evidence.sqlite3")
        self._lock = RLock()
        self._db = sqlite3.connect(self.path, check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        self.write_error: str | None = None
        self._db.executescript("""
            CREATE TABLE IF NOT EXISTS evidence (
                sequence INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL, record_key TEXT NOT NULL, binding_id TEXT NOT NULL DEFAULT '',
                resource_ref TEXT, run_id TEXT, activation_id TEXT, step_index INTEGER, cycle_id TEXT,
                payload TEXT NOT NULL, summary TEXT,
                UNIQUE(kind, record_key, binding_id)
            );
            CREATE INDEX IF NOT EXISTS evidence_run ON evidence(kind,binding_id,run_id,sequence);
            CREATE INDEX IF NOT EXISTS evidence_resource ON evidence(kind,resource_ref,cycle_id,sequence);
            CREATE INDEX IF NOT EXISTS evidence_step ON evidence(kind,binding_id,run_id,activation_id,step_index);
            CREATE TABLE IF NOT EXISTS bindings (source_id TEXT PRIMARY KEY, binding_id TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS resources (resource_ref TEXT PRIMARY KEY, payload TEXT NOT NULL);
        """)
        self._db.commit()

    def register_binding(self, store_binding_id: str, source_id: str) -> None:
        """记录主机已确认的 exact storage identity。"""
        with self._lock, self._db:
            self._db.execute(
                "INSERT OR REPLACE INTO bindings VALUES (?,?)", (source_id, store_binding_id)
            )

    def register_resource(self, resource: ResourceRef) -> None:
        """登记协调器真实 ref 与主机 URL 身份。"""
        with self._lock, self._db:
            self._db.execute(
                "INSERT OR REPLACE INTO resources VALUES (?,?)",
                (resource.resource_ref, _json(_typed(resource))),
            )

    def register_configuration(self, configuration: EffectiveConfiguration) -> None:
        """记录构造后已实际描述的配置，首次 Run 前也可查询。"""
        self._put("configuration", configuration.configuration_snapshot_id, _typed(configuration))

    def publisher(self, broker: LivePublisher, store_binding_id: str | None) -> LivePublisher:
        """返回先记录原 fact、再原样转发 lineage 的组合出口。"""
        return _RecordingPublisher(self, broker, store_binding_id)

    def span_exporter(self) -> SpanExporter:
        """标准 SDK exporter，只接收实际结束的模型 span。"""
        return _EvidenceExporter(self)

    def _put(
        self,
        kind: str,
        key: str,
        payload: Any,
        *,
        binding_id: str | None = None,
        resource_ref: str | None = None,
        run_id: str | None = None,
        activation_id: str | None = None,
        step_index: int | None = None,
        cycle_id: str | None = None,
        summary: Any = None,
    ) -> None:
        with self._lock, self._db:
            self._db.execute(
                """INSERT INTO evidence
                (kind,record_key,binding_id,resource_ref,run_id,activation_id,step_index,cycle_id,payload,summary)
                VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(kind,record_key,binding_id)
                DO UPDATE SET payload=excluded.payload,summary=excluded.summary""",
                (
                    kind,
                    key,
                    binding_id or "",
                    resource_ref,
                    run_id,
                    activation_id,
                    step_index,
                    cycle_id,
                    _json(payload),
                    None if summary is None else _json(summary),
                ),
            )

    def record(self, value: LiveFact, binding_id: str | None) -> None:
        """只记录原事实；不读取当前文件或重建历史消息。"""
        fact = value.fact if isinstance(value, LineagedLiveFact) else value
        if isinstance(fact, ContextPreparation):
            payload = _typed(fact)
            summary = {key: payload[key] for key in ContextPreparationSummary.model_fields}
            self._put(
                "preparation",
                fact.preparation_id,
                payload,
                binding_id=binding_id,
                run_id=fact.run_id,
                activation_id=fact.activation_id,
                step_index=fact.step_index,
                summary=summary,
            )
        elif isinstance(fact, ConfigurationApplied):
            self.register_binding(binding_id, fact.configuration.storage.source_id)
            self.register_configuration(fact.configuration)
            self._put(
                "configuration_adoption",
                fact.activation_id,
                _typed(fact),
                binding_id=binding_id,
                run_id=fact.run_id,
                activation_id=fact.activation_id,
            )
        elif isinstance(fact, SourceAdopted):
            self._put(
                "source",
                fact.adoption_id,
                _typed(fact),
                binding_id=binding_id,
                resource_ref=fact.resource_ref,
                run_id=fact.run_id,
                activation_id=fact.activation_id,
                step_index=fact.step_index,
                cycle_id=fact.maintenance_cycle_id,
            )
        elif isinstance(fact, RuntimeStreamEvent) and fact.model_event is not None:
            model_stream_id = fact.model_event.scope.model_stream_id
            if self.get("model_stream", model_stream_id, binding_id=binding_id) is not None:
                return
            with self._lock:
                row = self._db.execute(
                    """SELECT record_key FROM evidence WHERE kind='preparation'
                    AND binding_id=? AND run_id=? AND activation_id=? AND step_index=?
                    ORDER BY sequence DESC LIMIT 1""",
                    (binding_id or "", fact.run_id, fact.activation_id, fact.step_index),
                ).fetchone()
            link = ModelStreamLink(
                run_id=fact.run_id,
                activation_id=fact.activation_id,
                step_index=fact.step_index,
                model_stream_id=model_stream_id,
                preparation_id=None if row is None else row[0],
            )
            self._put(
                "model_stream",
                model_stream_id,
                _typed(link),
                binding_id=binding_id,
                run_id=fact.run_id,
                activation_id=fact.activation_id,
                step_index=fact.step_index,
            )

    def get(self, kind: str, key: str, *, binding_id: str | None = None) -> dict[str, Any] | None:
        """读取一份已记录证据。"""
        with self._lock:
            row = self._db.execute(
                "SELECT payload FROM evidence WHERE kind=? AND record_key=? AND binding_id=?",
                (kind, key, binding_id or ""),
            ).fetchone()
        return None if row is None else json.loads(row[0])

    def query(
        self,
        kind: str,
        *,
        binding_id: str | None = None,
        run_id: str | None = None,
        resource_ref: str | None = None,
        cycle_id: str | None = None,
        after: int = 0,
        limit: int = 50,
        summaries: bool = False,
        publication_id: str | None = None,
    ) -> tuple[list[dict[str, Any]], str | None]:
        """SQLite 有界查询；列表页不读取完整模型正文。"""
        filters = ["kind=?", "sequence>?"]
        parameters: list[Any] = [kind, after]
        for column, value in (
            ("binding_id", binding_id),
            ("run_id", run_id),
            ("resource_ref", resource_ref),
            ("cycle_id", cycle_id),
        ):
            if value is not None:
                filters.append(f"{column}=?")
                parameters.append(value)
        if publication_id is not None:
            filters.append(
                "EXISTS (SELECT 1 FROM json_each(evidence.payload,'$.source_versions') WHERE json_extract(value,'$[0]')='publication_id' AND json_extract(value,'$[1]')=?)"
            )
            parameters.append(publication_id)
        parameters.append(limit + 1)
        projection = "summary" if summaries else "payload"
        with self._lock:
            rows = self._db.execute(
                f"SELECT sequence,{projection} FROM evidence WHERE {' AND '.join(filters)} ORDER BY sequence LIMIT ?",
                parameters,
            ).fetchall()
        page = rows[:limit]
        return [json.loads(row[1]) for row in page], str(page[-1][0]) if len(rows) > limit else None

    def all_for_run(self, kind: str, binding_id: str, run_id: str) -> list[dict[str, Any]]:
        """读取契约规定的当前 Run 完整关联短列表。"""
        with self._lock:
            rows = self._db.execute(
                "SELECT payload FROM evidence WHERE kind=? AND binding_id=? AND run_id=? ORDER BY sequence",
                (kind, binding_id, run_id),
            ).fetchall()
        return [json.loads(row[0]) for row in rows]

    def export_run(self, binding_id: str, run_id: str) -> dict[str, Any]:
        """用户显式导出选定 Run 的全部已记录证据，不扩展到其他运行。"""
        result = {
            kind: self.all_for_run(kind, binding_id, run_id)
            for kind in (
                "preparation",
                "configuration_adoption",
                "source",
                "model_stream",
                "model_call",
            )
        }
        result["recording"] = {
            "recording_enabled": True,
            "pending_writes": 0,
            "write_error": self.write_error,
        }
        return result

    def record_span(self, span: ReadableSpan) -> None:
        """记录 provider wrapper 发出的真实模型 span，不重拼流式文本。"""
        attributes = dict(span.attributes or {})
        if attributes.get("gen_ai.operation.name") != "chat":
            return
        source_id = attributes.get("iris.lifecycle.source_id")
        resource_ref = attributes.get("iris.resource.ref")
        run_id = attributes.get("iris.run.id")
        with self._lock:
            binding = self._db.execute(
                "SELECT binding_id FROM bindings WHERE source_id=?", (source_id,)
            ).fetchone()
            resource = self._db.execute(
                "SELECT payload FROM resources WHERE resource_ref=?", (resource_ref,)
            ).fetchone()
        binding_id = None if binding is None else binding[0]
        source = None
        if resource is not None:
            source = json.loads(resource[0])
        elif binding_id is not None and run_id is not None:
            source = {"store_binding_id": binding_id, "source_id": source_id, "run_id": run_id}
        context = span.context
        record_id = f"{context.trace_id:032x}:{context.span_id:016x}"
        summary = {
            "record_id": record_id,
            "source": source,
            "trace_id": f"{context.trace_id:032x}",
            "span_id": f"{context.span_id:016x}",
            "parent_span_id": None if span.parent is None else f"{span.parent.span_id:016x}",
            "started_at": datetime.fromtimestamp(span.start_time / 1e9, UTC).isoformat(),
            "ended_at": datetime.fromtimestamp(span.end_time / 1e9, UTC).isoformat(),
            "outcome": attributes.get("iris.model.outcome", span.status.status_code.name.lower()),
        }
        for name, attribute in (
            ("activation_id", "iris.activation.id"),
            ("step_index", "iris.step.index"),
            ("purpose", "iris.model.purpose"),
            ("model_stream_id", "iris.model_stream.id"),
            ("request_model", "gen_ai.request.model"),
            ("response_model", "gen_ai.response.model"),
            ("input_tokens", "gen_ai.usage.input_tokens"),
            ("output_tokens", "gen_ai.usage.output_tokens"),
            ("preparation_id", "iris.context.preparation_id"),
            ("configuration_snapshot_id", "iris.configuration.snapshot_id"),
        ):
            summary[name] = attributes.get(attribute)
        config = (
            self.get("configuration", summary["configuration_snapshot_id"])
            if summary["configuration_snapshot_id"]
            else None
        )
        capture_disabled = (
            config is not None and not config["agent_config"]["observability"]["capture_content"]
        )
        truncated = list(attributes.get("iris.content.truncated_fields", ()))

        def content(attribute: str) -> dict[str, Any]:
            if attribute in attributes:
                return {
                    "status": "available",
                    "reason": None,
                    "data": json.loads(attributes[attribute]),
                }
            reason = (
                "truncated"
                if attribute in truncated
                else "capture_content_disabled"
                if capture_disabled
                else "not_recorded"
            )
            return {
                "status": "disabled" if capture_disabled else "not_collected",
                "reason": reason,
                "data": None,
            }

        record = {
            "summary": summary,
            "attributes": attributes,
            "events": [
                {
                    "name": event.name,
                    "timestamp": event.timestamp,
                    "attributes": dict(event.attributes or {}),
                }
                for event in span.events
            ],
            "input": content("gen_ai.input.messages"),
            "output": content("gen_ai.output.messages"),
            "tool_definitions": content("gen_ai.tool.definitions"),
            "truncated_fields": truncated,
            "previews": {
                name: attributes[f"iris.content.{name}.preview"]
                for name in truncated
                if f"iris.content.{name}.preview" in attributes
            },
        }
        self._put(
            "model_call",
            record_id,
            record,
            binding_id=binding_id,
            resource_ref=resource_ref,
            run_id=run_id,
            activation_id=summary["activation_id"],
            step_index=summary["step_index"],
            cycle_id=attributes.get("iris.maintenance.cycle_id"),
            summary=summary,
        )

    async def close(self) -> None:
        """在宿主已 flush tracer 后关闭自己的只读证据连接。"""
        with self._lock:
            self._db.close()


class _RecordingPublisher:
    """不改写 publisher 的业务事实或 lineage。"""

    def __init__(
        self, recorder: EvidenceRecorder, broker: LivePublisher, binding_id: str | None
    ) -> None:
        self.recorder = recorder
        self.broker = broker
        self.binding_id = binding_id

    def publish(self, fact: LiveFact) -> None:
        """失败记录可见，但不让观测故障夺取 Run ownership。"""
        try:
            self.recorder.record(fact, self.binding_id)
        except (sqlite3.Error, TypeError, ValueError) as exc:
            self.recorder.write_error = str(exc)
        self.broker.publish(fact)


class _EvidenceExporter(SpanExporter):
    """标准 OpenTelemetry SDK 导出接点。"""

    def __init__(self, recorder: EvidenceRecorder) -> None:
        self.recorder = recorder

    def export(self, spans: Sequence[ReadableSpan]) -> SpanExportResult:
        """持久化实际完成的 span。"""
        try:
            for span in spans:
                self.recorder.record_span(span)
        except (sqlite3.Error, TypeError, ValueError) as exc:
            self.recorder.write_error = str(exc)
            return SpanExportResult.FAILURE
        return SpanExportResult.SUCCESS

    def shutdown(self) -> None:
        """连接由 EvidenceRecorder 在 tracer 排空后统一关闭。"""


def _after(value: str | None) -> int:
    if value is None:
        return 0
    try:
        return TypeAdapter(Annotated[int, Field(ge=0)]).validate_json(value)
    except ValueError as exc:
        raise HostError(422, "INVALID_CURSOR", "证据游标无效") from exc


@router.get(
    "/stores/{store_binding_id}/runs/{run_id}/preparations",
    response_model=Page[ContextPreparationSummary],
)
def preparations(
    store_binding_id: str,
    run_id: str,
    host: Host,
    after: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> Page[Any]:
    """只查询已保存的真实上下文事实。"""
    host.binding(store_binding_id)
    items, cursor = host.evidence.query(
        "preparation",
        binding_id=store_binding_id,
        run_id=run_id,
        after=_after(after),
        limit=limit,
        summaries=True,
    )
    return Page(items=items, next_cursor=cursor)


@router.get(
    "/stores/{store_binding_id}/preparations/{preparation_id}",
    response_model=Observation[ContextPreparation],
)
def preparation(store_binding_id: str, preparation_id: str, host: Host) -> Observation[Any]:
    """缺失明确显示未采集，不从历史重建。"""
    host.binding(store_binding_id)
    data = host.evidence.get("preparation", preparation_id, binding_id=store_binding_id)
    return Observation(
        status="available" if data is not None else "not_collected",
        reason=None if data is not None else "未记录该准备事实",
        data=data,
    )


@router.get(
    "/stores/{store_binding_id}/runs/{run_id}/configuration-adoptions",
    response_model=EvidenceItems[ConfigurationApplied],
)
def configuration_adoptions(store_binding_id: str, run_id: str, host: Host) -> dict[str, Any]:
    """返回完整配置采用事实。"""
    host.binding(store_binding_id)
    return {"items": host.evidence.all_for_run("configuration_adoption", store_binding_id, run_id)}


@router.get(
    "/configuration-snapshots/{configuration_snapshot_id}", response_model=EffectiveConfiguration
)
def configuration_snapshot(configuration_snapshot_id: str, host: Host) -> dict[str, Any]:
    """读取当时快照。"""
    data = host.evidence.get("configuration", configuration_snapshot_id)
    if data is None:
        raise HostError(404, "NOT_FOUND", "配置快照未记录")
    return data


@router.get(
    "/stores/{store_binding_id}/runs/{run_id}/source-adoptions",
    response_model=EvidenceItems[SourceAdopted],
)
def source_adoptions(store_binding_id: str, run_id: str, host: Host) -> dict[str, Any]:
    """只展示真实采用的来源。"""
    host.binding(store_binding_id)
    return {"items": host.evidence.all_for_run("source", store_binding_id, run_id)}


@router.get(
    "/stores/{store_binding_id}/runs/{run_id}/model-streams",
    response_model=EvidenceItems[ModelStreamLink],
)
def model_streams(store_binding_id: str, run_id: str, host: Host) -> dict[str, Any]:
    """提供原 Runtime 事件的模型关联。"""
    host.binding(store_binding_id)
    return {"items": host.evidence.all_for_run("model_stream", store_binding_id, run_id)}


@router.get("/evidence/model-calls", response_model=Page[ModelCallSummary])
def model_calls(
    host: Host,
    store_binding_id: str | None = None,
    run_id: str | None = None,
    resource_id: str | None = None,
    cycle_id: str | None = None,
    after: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> Page[Any]:
    """按 exact Run 或资源周期读取摘要，不查询所有模型正文。"""
    resource_ref = None
    if (
        store_binding_id is not None
        and run_id is not None
        and resource_id is None
        and cycle_id is None
    ):
        host.binding(store_binding_id)
    elif (
        resource_id is not None
        and cycle_id is not None
        and store_binding_id is None
        and run_id is None
    ):
        resource = host.resources.get(resource_id)
        if resource is None:
            raise HostError(404, "NOT_FOUND", "资源不存在")
        resource_ref = resource.ref.resource_ref
    else:
        raise HostError(
            422, "INVALID_SCOPE", "指定 store_binding_id/run_id 或 resource_id/cycle_id"
        )
    items, cursor = host.evidence.query(
        "model_call",
        binding_id=store_binding_id,
        run_id=run_id,
        resource_ref=resource_ref,
        cycle_id=cycle_id,
        after=_after(after),
        limit=limit,
        summaries=True,
    )
    return Page(items=items, next_cursor=cursor)


@router.get("/evidence/model-calls/{record_id}", response_model=ModelCallRecord)
def model_call(record_id: str, host: Host) -> dict[str, Any]:
    """按全局 trace/span 身份读取；不推断未报告用量。"""
    with host.evidence._lock:
        row = host.evidence._db.execute(
            "SELECT payload FROM evidence WHERE kind='model_call' AND record_key=?", (record_id,)
        ).fetchone()
    if row is None:
        raise HostError(404, "NOT_FOUND", "模型调用尚未记录")
    return json.loads(row[0])


@router.get("/resources/{resource_id}/source-adoptions", response_model=Page[SourceAdopted])
def resource_adoptions(
    resource_id: str,
    host: Host,
    after: str | None = None,
    publication_id: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> Page[Any]:
    """资源来源不扩散到某个当前 Run。"""
    resource = host.resources.get(resource_id)
    if resource is None:
        raise HostError(404, "NOT_FOUND", "资源不存在")
    items, cursor = host.evidence.query(
        "source",
        resource_ref=resource.ref.resource_ref,
        after=_after(after),
        limit=limit,
        publication_id=publication_id,
    )
    return Page(items=items, next_cursor=cursor)


@router.get("/evidence/status", response_model=EvidenceStatus)
def evidence_status(
    host: Host,
    store_binding_id: str | None = None,
    run_id: str | None = None,
    resource_id: str | None = None,
) -> EvidenceStatus:
    """记录器同步提交，因此无后台 pending writes。"""
    if store_binding_id is not None:
        host.binding(store_binding_id)
    if resource_id is not None and resource_id not in host.resources:
        raise HostError(404, "NOT_FOUND", "资源不存在")
    return EvidenceStatus(
        recording_enabled=True, pending_writes=0, write_error=host.evidence.write_error
    )
