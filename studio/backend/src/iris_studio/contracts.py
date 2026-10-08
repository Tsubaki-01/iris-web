"""Studio HTTP 与实际消费 SSE 的唯一协议模型。"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from iris.agents import AgentConfig
from iris.harness import GoalView, ResourceMaintenanceView, SessionControlSnapshot
from iris.lifecycle import AgentRunOptions, RunEventKind
from iris.lifecycle.history import RunLineage
from iris.message import TextBlock
from pydantic import BaseModel, ConfigDict, Field

from .media_models import ImageInput


class DTO(BaseModel):
    """HTTP 边界模型；内部领域对象直接序列化。"""

    model_config = ConfigDict(extra="forbid")


class Page[T](DTO):
    """不透明领域游标页。"""

    items: list[T]
    next_cursor: str | None = None


class Observation[T](DTO):
    """已知采集状态与真实内容。"""

    status: Literal["available", "disabled", "not_triggered", "not_collected"]
    reason: str | None = None
    data: T | None = None


class FieldError(DTO):
    """输入字段错误。"""

    path: str
    message: str


class ApiError(DTO):
    """HTTP 错误正文。"""

    code: str
    message: str
    request_id: str | None = None
    field_errors: list[FieldError] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)


class HostError(Exception):
    """Studio 已知边界错误。"""

    def __init__(
        self, status: int, code: str, message: str, details: dict[str, Any] | None = None
    ) -> None:
        super().__init__(message)
        self.status = status
        self.error = ApiError(code=code, message=message, details=details or {})


class SessionRef(DTO):
    """跨存储会话身份。"""

    store_binding_id: str
    source_id: str
    session_id: str


class RunRef(DTO):
    """跨存储运行身份。"""

    store_binding_id: str
    source_id: str
    run_id: str


class ResourceRef(DTO):
    """维护资源的主机与领域身份。"""

    resource_id: str
    resource_ref: str
    kind: Literal["memory", "evolution"]
    display_name: str


class WorkspaceView(DTO):
    """已登记目录。"""

    workspace_id: str
    path: str
    title: str


class ProfileView(DTO):
    """原配置文件入口。"""

    profile_id: str
    workspace_id: str
    title: str
    config_path: str
    saved_revision_id: str | None = None
    latest_generation_id: str | None = None


class StorageBindingView(DTO):
    """实际存储绑定。"""

    store_binding_id: str
    backend: Literal["memory", "sqlite"]
    resolved_path: str | None = None
    source_id: str
    available: bool = True


class RecoverySource(DTO):
    """独立恢复实例采用的原实例身份。"""

    selected_generation_id: str
    selected_store_binding_id: str


class GenerationView(DTO):
    """一次真实配置采用。"""

    generation_id: str
    profile_id: str
    config_revision_id: str
    requested_config_revision_id: str | None = None
    store_binding_id: str
    source_id: str
    configuration_snapshot_id: str
    constructed_at: datetime
    state: Literal["ready", "retiring", "retired"]
    resource_refs: list[ResourceRef] = Field(default_factory=list)
    recovery_source: RecoverySource | None = None


class ConfigDocument(DTO):
    """保留原文的单文件草稿。"""

    document_id: str
    kind: Literal["agent", "context", "mcp", "decision", "subagent_catalog", "prompt", "skill"]
    original_path: str
    base_text: str
    draft_text: str
    draft_revision: int


class ConfigDraft(DTO):
    """Profile 的同源文档草稿。"""

    profile_id: str
    draft_revision: int
    documents: list[ConfigDocument]


class ConfigDiagnostic(DTO):
    """文件语法与领域解析诊断。"""

    document_id: str
    path: str | None = None
    message: str
    severity: Literal["error", "warning"]


class ConfigValidation(DTO):
    """仅声明解析的验证结果。"""

    valid: bool
    checked_scope: list[str]
    diagnostics: list[ConfigDiagnostic]
    effective_agent_config: AgentConfig | None


class OperationAccepted(DTO):
    """已被主机持有的操作引用。"""

    request_id: str
    operation_id: str
    backend_epoch: str
    location: str


class OperationView(DTO):
    """进程内任务观察，不是持久业务队列。"""

    operation_id: str
    backend_epoch: str
    kind: Literal["apply", "retire", "maintenance", "export", "import"]
    state: Literal["running", "succeeded", "failed"] = "running"
    blockers: list[dict[str, Any]] = Field(default_factory=list)
    result: Any | None = None
    error: ApiError | None = None


class SessionView(DTO):
    """已登记或持久存在的会话。"""

    ref: SessionRef
    title: str
    generation_id: str | None = None
    has_durable_state: bool
    forked_from_run_id: str | None = None


class RequestId(DTO):
    """可选请求关联，不提供幂等承诺。"""

    request_id: str | None = None


class SubmitInput(RequestId):
    """会话输入准入。"""

    input: str | list[TextBlock | ImageInput]
    mode: Literal["auto", "steer", "follow_up"] = "auto"
    options: AgentRunOptions | None = None


class StreamReady(DTO):
    """订阅已登记的首帧。"""

    connection_id: str
    backend_epoch: str
    store_binding_id: str | None
    source_id: str | None
    resource_id: str | None
    stream_epoch: str
    scope: Literal["session_tree", "resource"]
    scope_id: str


class ControlPayload(DTO):
    """完整控制快照通知。"""

    snapshot: SessionControlSnapshot


class ConfigurationPayload(DTO):
    """完整配置事实的索引。"""

    configuration_snapshot_id: str
    agent_id: str


class PreparationPayload(DTO):
    """准备退出时的摘要索引。"""

    preparation_id: str
    phase: str
    step_index: int
    configuration_snapshot_id: str
    stage_count: int
    final_input_tokens: int | None


class ModelBase(DTO):
    """模型原始流身份。"""

    model_stream_id: str
    provider_sequence: int
    occurred_at: datetime


class ModelStarted(ModelBase):
    """模型响应开始。"""

    response_id: str | None


class ModelBlock(ModelBase):
    """模型输出块身份。"""

    block_index: int
    block_id: str
    block_kind: str
    tool_call_id: str | None = None


class ModelDelta(ModelBlock):
    """可合并快照；前端以 snapshot 覆盖。"""

    channel: str
    delta: str
    snapshot: str


class LiveUsage(DTO):
    """模型实际报告的用量。"""

    input_tokens: int
    output_tokens: int
    total_tokens: int
    complete: bool | None = None


class LiveError(DTO):
    """轻量运行错误。"""

    code: str
    message: str
    retryable: bool


class ModelCompleted(ModelBase):
    """模型完成不代表 durable 消息提交。"""

    provider: str
    model: str
    response_id: str | None
    finish_reason: str | None
    usage: LiveUsage
    semantic_output_emitted: bool


class ModelFailed(ModelBase):
    """模型流错误。"""

    error: LiveError
    semantic_output_emitted: bool


class ModelCancelled(ModelBase):
    """模型取消。"""

    error: LiveError | None = None
    semantic_output_emitted: bool


class ModelUsage(ModelBase):
    """实际用量更新。"""

    usage: LiveUsage


class StepPayload(DTO):
    """模型或压缩步骤通知。"""

    step_index: int


class ToolPayload(DTO):
    """工具执行摘要身份。"""

    tool_call_id: str
    tool_name: str
    tool_ordinal: int


class ToolCompleted(ToolPayload):
    """完整结果仍从 HTTP 读取。"""

    content: list[str]
    is_error: bool
    error: LiveError | None = None
    artifact: dict[str, Any] | None = None
    file_change: dict[str, Any] | None = None


class SubmissionPayload(DTO):
    """输入投递通知。"""

    submission_id: str
    mode: str | None
    state: str
    reason: str | None = None


class DurableEventPayload(DTO):
    """持久事件的公开轻量字段。"""

    occurred_at: datetime
    step_index: int | None = None
    correlation_id: str | None = None
    reason: str | None = None
    stop_reason: str | None = None


class SourcePayload(DTO):
    """已采用来源的真实索引。"""

    adoption_id: str
    source_kind: str
    owner_kind: str
    adoption_boundary: str
    step_index: int | None
    preparation_id: str | None
    maintenance_cycle_id: str | None
    document_ids: list[str]


class LineagePayload(DTO):
    """子任务固定归属。"""

    lineage: RunLineage


class GoalPayload(DTO):
    """真实目标状态通知。"""

    view: GoalView


class MaintenancePayload(DTO):
    """共享维护资源状态。"""

    coordinator_id: str
    revision: int
    foreground_count: int
    resource: ResourceMaintenanceView


class CleanupError(DTO):
    """命令清理失败的真实来源。"""

    code: str
    source: str
    message: str


class CleanupPayload(DTO):
    """命令清理失败不伪装终态。"""

    error: CleanupError


SSE_PAYLOADS: dict[str, type[BaseModel]] = {
    **{kind.value: DurableEventPayload for kind in RunEventKind},
    "stream.ready": StreamReady,
    "session.control.changed": ControlPayload,
    "configuration.applied": ConfigurationPayload,
    "context.preparation": PreparationPayload,
    "source.adopted": SourcePayload,
    "subagent.linked": LineagePayload,
    "goal.changed": GoalPayload,
    "maintenance.changed": MaintenancePayload,
    "command.cleanup.failed": CleanupPayload,
    "model.response.started": ModelStarted,
    "model.block.started": ModelBlock,
    "model.block.delta": ModelDelta,
    "model.block.completed": ModelBlock,
    "model.usage.updated": ModelUsage,
    "model.response.completed": ModelCompleted,
    "model.response.failed": ModelFailed,
    "model.response.cancelled": ModelCancelled,
    "model.step.started": StepPayload,
    "tool.preparing": ToolPayload,
    "tool.started": ToolPayload,
    "tool.completed": ToolCompleted,
    **{f"context.compaction.{kind}": StepPayload for kind in ("started", "completed", "failed")},
    **{f"submission.{kind}": SubmissionPayload for kind in ("pending", "delivered", "failed")},
}
