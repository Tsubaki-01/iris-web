/* Generated from the host SSE schema. Do not edit. */

export type StudioSse =
  | RunStartedEnvelope
  | ActivationStartedEnvelope
  | ModelStepReservedEnvelope
  | ModelStepCommittedEnvelope
  | ContextCompactedEnvelope
  | ToolCallClaimedEnvelope
  | ToolCallCommittedEnvelope
  | ToolCallOutcomeUnknownEnvelope
  | InteractionSuspendedEnvelope
  | InteractionResolvedEnvelope
  | RunCancellationRequestedEnvelope
  | ActivationAbandonedEnvelope
  | RunTerminalEnvelope
  | SessionControlChangedEnvelope
  | ConfigurationAppliedEnvelope
  | ContextPreparationEnvelope
  | SourceAdoptedEnvelope
  | SubagentLinkedEnvelope
  | GoalChangedEnvelope
  | MaintenanceChangedEnvelope
  | CommandCleanupFailedEnvelope
  | ModelResponseStartedEnvelope
  | ModelBlockStartedEnvelope
  | ModelBlockDeltaEnvelope
  | ModelBlockCompletedEnvelope
  | ModelUsageUpdatedEnvelope
  | ModelResponseCompletedEnvelope
  | ModelResponseFailedEnvelope
  | ModelResponseCancelledEnvelope
  | ModelStepStartedEnvelope
  | ToolPreparingEnvelope
  | ToolStartedEnvelope
  | ToolCompletedEnvelope
  | ContextCompactionStartedEnvelope
  | ContextCompactionCompletedEnvelope
  | ContextCompactionFailedEnvelope
  | SubmissionPendingEnvelope
  | SubmissionDeliveredEnvelope
  | SubmissionFailedEnvelope
  | ReplayGap
  | SubscriptionTerminal
  | StreamReady;
export type StreamEpoch = string;
export type LiveScope = "run" | "session" | "session_tree" | "resource";
export type ScopeId = string;
export type LiveSequence = number;
export type Kind = "run.started";
export type RunId = string | null;
export type SessionId = string | null;
export type ActivationId = string | null;
export type DurableSequence = number | null;
export type OccurredAt = string;
export type StepIndex = number | null;
export type CorrelationId = string | null;
export type Reason = string | null;
export type StopReason = string | null;
export type RootSessionId = string;
export type RootRunId = string;
export type ParentRunId = string;
export type ParentToolCallId = string;
export type ChildRunId = string;
export type ChildSessionId = string;
export type AgentSelector = string;
export type StreamEpoch1 = string;
export type ScopeId1 = string;
export type LiveSequence1 = number;
export type Kind1 = "activation.started";
export type RunId1 = string | null;
export type SessionId1 = string | null;
export type ActivationId1 = string | null;
export type DurableSequence1 = number | null;
export type StreamEpoch2 = string;
export type ScopeId2 = string;
export type LiveSequence2 = number;
export type Kind2 = "model_step.reserved";
export type RunId2 = string | null;
export type SessionId2 = string | null;
export type ActivationId2 = string | null;
export type DurableSequence2 = number | null;
export type StreamEpoch3 = string;
export type ScopeId3 = string;
export type LiveSequence3 = number;
export type Kind3 = "model_step.committed";
export type RunId3 = string | null;
export type SessionId3 = string | null;
export type ActivationId3 = string | null;
export type DurableSequence3 = number | null;
export type StreamEpoch4 = string;
export type ScopeId4 = string;
export type LiveSequence4 = number;
export type Kind4 = "context.compacted";
export type RunId4 = string | null;
export type SessionId4 = string | null;
export type ActivationId4 = string | null;
export type DurableSequence4 = number | null;
export type StreamEpoch5 = string;
export type ScopeId5 = string;
export type LiveSequence5 = number;
export type Kind5 = "tool_call.claimed";
export type RunId5 = string | null;
export type SessionId5 = string | null;
export type ActivationId5 = string | null;
export type DurableSequence5 = number | null;
export type StreamEpoch6 = string;
export type ScopeId6 = string;
export type LiveSequence6 = number;
export type Kind6 = "tool_call.committed";
export type RunId6 = string | null;
export type SessionId6 = string | null;
export type ActivationId6 = string | null;
export type DurableSequence6 = number | null;
export type StreamEpoch7 = string;
export type ScopeId7 = string;
export type LiveSequence7 = number;
export type Kind7 = "tool_call.outcome_unknown";
export type RunId7 = string | null;
export type SessionId7 = string | null;
export type ActivationId7 = string | null;
export type DurableSequence7 = number | null;
export type StreamEpoch8 = string;
export type ScopeId8 = string;
export type LiveSequence8 = number;
export type Kind8 = "interaction.suspended";
export type RunId8 = string | null;
export type SessionId8 = string | null;
export type ActivationId8 = string | null;
export type DurableSequence8 = number | null;
export type StreamEpoch9 = string;
export type ScopeId9 = string;
export type LiveSequence9 = number;
export type Kind9 = "interaction.resolved";
export type RunId9 = string | null;
export type SessionId9 = string | null;
export type ActivationId9 = string | null;
export type DurableSequence9 = number | null;
export type StreamEpoch10 = string;
export type ScopeId10 = string;
export type LiveSequence10 = number;
export type Kind10 = "run.cancellation_requested";
export type RunId10 = string | null;
export type SessionId10 = string | null;
export type ActivationId10 = string | null;
export type DurableSequence10 = number | null;
export type StreamEpoch11 = string;
export type ScopeId11 = string;
export type LiveSequence11 = number;
export type Kind11 = "activation.abandoned";
export type RunId11 = string | null;
export type SessionId11 = string | null;
export type ActivationId11 = string | null;
export type DurableSequence11 = number | null;
export type StreamEpoch12 = string;
export type ScopeId12 = string;
export type LiveSequence12 = number;
export type Kind12 = "run.terminal";
export type RunId12 = string | null;
export type SessionId12 = string | null;
export type ActivationId12 = string | null;
export type DurableSequence12 = number | null;
export type StreamEpoch13 = string;
export type ScopeId13 = string;
export type LiveSequence13 = number;
export type Kind13 = "session.control.changed";
export type RunId13 = string | null;
export type SessionId13 = string | null;
export type ActivationId13 = string | null;
export type DurableSequence13 = number | null;
export type ManagerId = string;
export type Revision = number;
export type SessionId14 = string;
export type CurrentRunId = string | null;
export type RunId14 = string;
export type SessionId15 = string;
export type AgentId = string;
/**
 * Logical run 的外部可见阶段。
 */
export type RunPhase = "active" | "waiting" | "terminal";
/**
 * Terminal run 的稳定停止原因。
 */
export type RunStopReason =
  | "completed"
  | "failed"
  | "cancelled"
  | "deadline_exceeded"
  | "interaction_expired"
  | "budget_exhausted"
  | "outcome_unknown";
export type Revision1 = number;
export type CurrentActivationId = string | null;
export type PendingInteractionId = string | null;
export type CancellationRequestedAt = string | null;
export type CancellationReason = string | null;
export type MaxModelSteps = number;
export type DeadlineAt = string | null;
export type InteractionTimeoutSeconds = number | null;
export type ModelStepsReserved = number;
export type ModelStepsCommitted = number;
export type ToolCallsCommitted = number;
export type InputTokens = number;
export type OutputTokens = number;
export type TotalTokens = number;
export type InputTokens1 = number;
export type OutputTokens1 = number;
export type TotalTokens1 = number;
export type CheckpointSequence = number;
export type LastEventSequence = number;
export type CreatedAt = string;
export type StartedAt = string;
export type UpdatedAt = string;
export type FinishedAt = string | null;
export type DriverState = "idle" | "admitting" | "running" | "settling" | "detached" | "closed";
export type SubmissionId = string;
export type RunId15 = string;
export type Mode = ("steer" | "follow_up") | null;
export type Input = string | (TextBlock | ImageBlock)[];
export type Type = "text";
export type Text = string;
export type Type1 = "image";
export type Path = string;
export type MimeType = string;
export type Width = number;
export type Height = number;
export type Name = string | null;
export type Stage = "queued" | "committing" | "admitting";
export type SubmittedAt = string;
export type Pending = PendingSubmission[];
export type AllowedCommands = string[];
export type PendingScope = "process_local";
/**
 * 人工响应的生命周期状态。
 */
export type InteractionStatus = "pending" | "resolved" | "closed";
export type StreamEpoch14 = string;
export type ScopeId14 = string;
export type LiveSequence14 = number;
export type Kind14 = "configuration.applied";
export type RunId16 = string | null;
export type SessionId16 = string | null;
export type ActivationId14 = string | null;
export type DurableSequence14 = number | null;
export type ConfigurationSnapshotId = string;
export type AgentId1 = string;
export type StreamEpoch15 = string;
export type ScopeId15 = string;
export type LiveSequence15 = number;
export type Kind15 = "context.preparation";
export type RunId17 = string | null;
export type SessionId17 = string | null;
export type ActivationId15 = string | null;
export type DurableSequence15 = number | null;
export type PreparationId = string;
export type Phase = string;
export type StepIndex1 = number;
export type ConfigurationSnapshotId1 = string;
export type StageCount = number;
export type FinalInputTokens = number | null;
export type StreamEpoch16 = string;
export type ScopeId16 = string;
export type LiveSequence16 = number;
export type Kind16 = "source.adopted";
export type RunId18 = string | null;
export type SessionId18 = string | null;
export type ActivationId16 = string | null;
export type DurableSequence16 = number | null;
export type AdoptionId = string;
export type SourceKind = string;
export type OwnerKind = string;
export type AdoptionBoundary = string;
export type StepIndex2 = number | null;
export type PreparationId1 = string | null;
export type MaintenanceCycleId = string | null;
export type DocumentIds = string[];
export type StreamEpoch17 = string;
export type ScopeId17 = string;
export type LiveSequence17 = number;
export type Kind17 = "subagent.linked";
export type RunId19 = string | null;
export type SessionId19 = string | null;
export type ActivationId17 = string | null;
export type DurableSequence17 = number | null;
export type StreamEpoch18 = string;
export type ScopeId18 = string;
export type LiveSequence18 = number;
export type Kind18 = "goal.changed";
export type RunId20 = string | null;
export type SessionId20 = string | null;
export type ActivationId18 = string | null;
export type DurableSequence18 = number | null;
export type GoalId = string;
export type SessionId21 = string;
export type Revision2 = number;
export type Objective = string;
/**
 * 目标的四种持久业务状态。
 */
export type GoalStatus = "active" | "paused" | "blocked" | "completed";
export type Code = string;
export type Text1 = string;
export type MaxRounds = number;
export type RoundsStarted = number;
export type IncludeTools = boolean;
export type ToolTimeoutSeconds = number | null;
/**
 * 工具错误进入下一模型步或立即停止的策略。
 */
export type ToolErrorPolicy = "return_to_model" | "stop";
export type CreatedAt1 = string;
export type UpdatedAt1 = string;
export type Armed = boolean;
export type RunGoalId = string | null;
export type InteractionId = string;
export type SessionId22 = string;
export type RunId21 = string;
export type StepIndex3 = number;
export type ToolCallId = string;
/**
 * 人工响应的生命周期状态。
 */
export type InteractionStatus1 = "pending" | "resolved" | "closed";
export type ToolCallId1 = string;
export type ToolName = string;
export type WorkspaceRoot = string;
export type Fingerprint = string;
export type Prompt = PermissionPrompt | QuestionPrompt;
export type Kind19 = "permission";
export type Reason1 = string;
export type Kind20 = "question";
export type Question = string;
export type Options = string[];
export type ChildRunId1 = string;
export type ChildInteractionId = string;
export type AgentSelector1 = string;
/**
 * Sub Agent proxy 最早到期期限的归属。
 */
export type SubagentExpiryOwner =
  | "parent_run_deadline"
  | "parent_interaction_timeout"
  | "child_interaction_expiry"
  | "child_effective_deadline"
  | "outer_tool_timeout";
export type Response = (PermissionInteractionResponse | QuestionInteractionResponse) | null;
export type Kind21 = "permission";
export type Decision = "approve" | "reject";
export type Kind22 = "question";
export type Answer = string;
export type Version = number;
export type CreatedAt2 = string;
export type ExpiresAt = string | null;
export type ResolvedAt = string | null;
export type ClosedAt = string | null;
export type CloseReason = string | null;
export type SettlementPending = boolean;
export type Code1 = string;
export type Message = string;
export type Source =
  "config" | "context" | "provider" | "tool" | "memory" | "session" | "runtime" | "lifecycle" | "persistence";
export type StreamEpoch19 = string;
export type ScopeId19 = string;
export type LiveSequence19 = number;
export type Kind23 = "maintenance.changed";
export type RunId22 = string | null;
export type SessionId23 = string | null;
export type ActivationId19 = string | null;
export type DurableSequence19 = number | null;
export type CoordinatorId = string;
export type Revision3 = number;
export type ForegroundCount = number;
export type ResourceRef = string;
export type MaintenanceState =
  | "idle"
  | "waiting_for_idle"
  | "waiting_for_materials"
  | "waiting_for_foreground"
  | "waiting_for_lock"
  | "running"
  | "closing";
export type PendingRequestId = string | null;
export type CycleId = string | null;
export type NextEligibleAt = string | null;
export type LastResultRef = string | null;
export type PendingNewRuns = number;
export type MinPendingRuns = number;
export type StreamEpoch20 = string;
export type ScopeId20 = string;
export type LiveSequence20 = number;
export type Kind24 = "command.cleanup.failed";
export type RunId23 = string | null;
export type SessionId24 = string | null;
export type ActivationId20 = string | null;
export type DurableSequence20 = number | null;
export type Code2 = string;
export type Source1 = string;
export type Message1 = string;
export type StreamEpoch21 = string;
export type ScopeId21 = string;
export type LiveSequence21 = number;
export type Kind25 = "model.response.started";
export type RunId24 = string | null;
export type SessionId25 = string | null;
export type ActivationId21 = string | null;
export type DurableSequence21 = number | null;
export type ModelStreamId = string;
export type ProviderSequence = number;
export type OccurredAt1 = string;
export type ResponseId = string | null;
export type StreamEpoch22 = string;
export type ScopeId22 = string;
export type LiveSequence22 = number;
export type Kind26 = "model.block.started";
export type RunId25 = string | null;
export type SessionId26 = string | null;
export type ActivationId22 = string | null;
export type DurableSequence22 = number | null;
export type ModelStreamId1 = string;
export type ProviderSequence1 = number;
export type OccurredAt2 = string;
export type BlockIndex = number;
export type BlockId = string;
export type BlockKind = string;
export type ToolCallId2 = string | null;
export type StreamEpoch23 = string;
export type ScopeId23 = string;
export type LiveSequence23 = number;
export type Kind27 = "model.block.delta";
export type RunId26 = string | null;
export type SessionId27 = string | null;
export type ActivationId23 = string | null;
export type DurableSequence23 = number | null;
export type ModelStreamId2 = string;
export type ProviderSequence2 = number;
export type OccurredAt3 = string;
export type BlockIndex1 = number;
export type BlockId1 = string;
export type BlockKind1 = string;
export type ToolCallId3 = string | null;
export type Channel = string;
export type Delta = string;
export type Snapshot = string;
export type StreamEpoch24 = string;
export type ScopeId24 = string;
export type LiveSequence24 = number;
export type Kind28 = "model.block.completed";
export type RunId27 = string | null;
export type SessionId28 = string | null;
export type ActivationId24 = string | null;
export type DurableSequence24 = number | null;
export type StreamEpoch25 = string;
export type ScopeId25 = string;
export type LiveSequence25 = number;
export type Kind29 = "model.usage.updated";
export type RunId28 = string | null;
export type SessionId29 = string | null;
export type ActivationId25 = string | null;
export type DurableSequence25 = number | null;
export type ModelStreamId3 = string;
export type ProviderSequence3 = number;
export type OccurredAt4 = string;
export type InputTokens2 = number;
export type OutputTokens2 = number;
export type TotalTokens2 = number;
export type Complete = boolean | null;
export type StreamEpoch26 = string;
export type ScopeId26 = string;
export type LiveSequence26 = number;
export type Kind30 = "model.response.completed";
export type RunId29 = string | null;
export type SessionId30 = string | null;
export type ActivationId26 = string | null;
export type DurableSequence26 = number | null;
export type ModelStreamId4 = string;
export type ProviderSequence4 = number;
export type OccurredAt5 = string;
export type Provider = string;
export type Model = string;
export type ResponseId1 = string | null;
export type FinishReason = string | null;
export type SemanticOutputEmitted = boolean;
export type StreamEpoch27 = string;
export type ScopeId27 = string;
export type LiveSequence27 = number;
export type Kind31 = "model.response.failed";
export type RunId30 = string | null;
export type SessionId31 = string | null;
export type ActivationId27 = string | null;
export type DurableSequence27 = number | null;
export type ModelStreamId5 = string;
export type ProviderSequence5 = number;
export type OccurredAt6 = string;
export type Code3 = string;
export type Message2 = string;
export type Retryable = boolean;
export type SemanticOutputEmitted1 = boolean;
export type StreamEpoch28 = string;
export type ScopeId28 = string;
export type LiveSequence28 = number;
export type Kind32 = "model.response.cancelled";
export type RunId31 = string | null;
export type SessionId32 = string | null;
export type ActivationId28 = string | null;
export type DurableSequence28 = number | null;
export type ModelStreamId6 = string;
export type ProviderSequence6 = number;
export type OccurredAt7 = string;
export type SemanticOutputEmitted2 = boolean;
export type StreamEpoch29 = string;
export type ScopeId29 = string;
export type LiveSequence29 = number;
export type Kind33 = "model.step.started";
export type RunId32 = string | null;
export type SessionId33 = string | null;
export type ActivationId29 = string | null;
export type DurableSequence29 = number | null;
export type StepIndex4 = number;
export type StreamEpoch30 = string;
export type ScopeId30 = string;
export type LiveSequence30 = number;
export type Kind34 = "tool.preparing";
export type RunId33 = string | null;
export type SessionId34 = string | null;
export type ActivationId30 = string | null;
export type DurableSequence30 = number | null;
export type ToolCallId4 = string;
export type ToolName1 = string;
export type ToolOrdinal = number;
export type StreamEpoch31 = string;
export type ScopeId31 = string;
export type LiveSequence31 = number;
export type Kind35 = "tool.started";
export type RunId34 = string | null;
export type SessionId35 = string | null;
export type ActivationId31 = string | null;
export type DurableSequence31 = number | null;
export type StreamEpoch32 = string;
export type ScopeId32 = string;
export type LiveSequence32 = number;
export type Kind36 = "tool.completed";
export type RunId35 = string | null;
export type SessionId36 = string | null;
export type ActivationId32 = string | null;
export type DurableSequence32 = number | null;
export type ToolCallId5 = string;
export type ToolName2 = string;
export type ToolOrdinal1 = number;
export type Content = string[];
export type IsError = boolean;
export type Artifact = {
  [k: string]: unknown;
} | null;
export type FileChange = {
  [k: string]: unknown;
} | null;
export type StreamEpoch33 = string;
export type ScopeId33 = string;
export type LiveSequence33 = number;
export type Kind37 = "context.compaction.started";
export type RunId36 = string | null;
export type SessionId37 = string | null;
export type ActivationId33 = string | null;
export type DurableSequence33 = number | null;
export type StreamEpoch34 = string;
export type ScopeId34 = string;
export type LiveSequence34 = number;
export type Kind38 = "context.compaction.completed";
export type RunId37 = string | null;
export type SessionId38 = string | null;
export type ActivationId34 = string | null;
export type DurableSequence34 = number | null;
export type StreamEpoch35 = string;
export type ScopeId35 = string;
export type LiveSequence35 = number;
export type Kind39 = "context.compaction.failed";
export type RunId38 = string | null;
export type SessionId39 = string | null;
export type ActivationId35 = string | null;
export type DurableSequence35 = number | null;
export type StreamEpoch36 = string;
export type ScopeId36 = string;
export type LiveSequence36 = number;
export type Kind40 = "submission.pending";
export type RunId39 = string | null;
export type SessionId40 = string | null;
export type ActivationId36 = string | null;
export type DurableSequence36 = number | null;
export type SubmissionId1 = string;
export type Mode1 = string | null;
export type State = string;
export type Reason2 = string | null;
export type StreamEpoch37 = string;
export type ScopeId37 = string;
export type LiveSequence37 = number;
export type Kind41 = "submission.delivered";
export type RunId40 = string | null;
export type SessionId41 = string | null;
export type ActivationId37 = string | null;
export type DurableSequence37 = number | null;
export type StreamEpoch38 = string;
export type ScopeId38 = string;
export type LiveSequence38 = number;
export type Kind42 = "submission.failed";
export type RunId41 = string | null;
export type SessionId42 = string | null;
export type ActivationId38 = string | null;
export type DurableSequence38 = number | null;
export type Kind43 = "replay.gap";
export type ReplayGapReason = "epoch_changed" | "cursor_expired" | "unknown_cursor" | "slow_consumer";
export type StreamEpoch39 = string;
export type ScopeId39 = string;
export type AfterLiveSequence = number;
export type CurrentEpoch = string;
export type Kind44 = "subscription.terminal";
export type SubscriptionTerminalReason = "slow_consumer" | "broker_closed";
export type Message3 = string;
export type ConnectionId = string;
export type BackendEpoch = string;
export type StoreBindingId = string | null;
export type SourceId = string | null;
export type ResourceId = string | null;
export type StreamEpoch40 = string;
export type Scope = "session_tree" | "resource";
export type ScopeId40 = string;

export interface RunStartedEnvelope {
  stream_epoch: StreamEpoch;
  scope: LiveScope;
  scope_id: ScopeId;
  live_sequence: LiveSequence;
  kind?: Kind;
  run_id?: RunId;
  session_id?: SessionId;
  activation_id?: ActivationId;
  durable_sequence?: DurableSequence;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
/**
 * 持久事件的公开轻量字段。
 */
export interface DurableEventPayload {
  occurred_at: OccurredAt;
  step_index?: StepIndex;
  correlation_id?: CorrelationId;
  reason?: Reason;
  stop_reason?: StopReason;
}
/**
 * 由持久 link 固定的根会话与父工具身份。
 */
export interface RunLineage {
  root_session_id: RootSessionId;
  root_run_id: RootRunId;
  parent_run_id: ParentRunId;
  parent_tool_call_id: ParentToolCallId;
  child_run_id: ChildRunId;
  child_session_id: ChildSessionId;
  agent_selector: AgentSelector;
  [k: string]: unknown;
}
export interface ActivationStartedEnvelope {
  stream_epoch: StreamEpoch1;
  scope: LiveScope;
  scope_id: ScopeId1;
  live_sequence: LiveSequence1;
  kind?: Kind1;
  run_id?: RunId1;
  session_id?: SessionId1;
  activation_id?: ActivationId1;
  durable_sequence?: DurableSequence1;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ModelStepReservedEnvelope {
  stream_epoch: StreamEpoch2;
  scope: LiveScope;
  scope_id: ScopeId2;
  live_sequence: LiveSequence2;
  kind?: Kind2;
  run_id?: RunId2;
  session_id?: SessionId2;
  activation_id?: ActivationId2;
  durable_sequence?: DurableSequence2;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ModelStepCommittedEnvelope {
  stream_epoch: StreamEpoch3;
  scope: LiveScope;
  scope_id: ScopeId3;
  live_sequence: LiveSequence3;
  kind?: Kind3;
  run_id?: RunId3;
  session_id?: SessionId3;
  activation_id?: ActivationId3;
  durable_sequence?: DurableSequence3;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ContextCompactedEnvelope {
  stream_epoch: StreamEpoch4;
  scope: LiveScope;
  scope_id: ScopeId4;
  live_sequence: LiveSequence4;
  kind?: Kind4;
  run_id?: RunId4;
  session_id?: SessionId4;
  activation_id?: ActivationId4;
  durable_sequence?: DurableSequence4;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ToolCallClaimedEnvelope {
  stream_epoch: StreamEpoch5;
  scope: LiveScope;
  scope_id: ScopeId5;
  live_sequence: LiveSequence5;
  kind?: Kind5;
  run_id?: RunId5;
  session_id?: SessionId5;
  activation_id?: ActivationId5;
  durable_sequence?: DurableSequence5;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ToolCallCommittedEnvelope {
  stream_epoch: StreamEpoch6;
  scope: LiveScope;
  scope_id: ScopeId6;
  live_sequence: LiveSequence6;
  kind?: Kind6;
  run_id?: RunId6;
  session_id?: SessionId6;
  activation_id?: ActivationId6;
  durable_sequence?: DurableSequence6;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ToolCallOutcomeUnknownEnvelope {
  stream_epoch: StreamEpoch7;
  scope: LiveScope;
  scope_id: ScopeId7;
  live_sequence: LiveSequence7;
  kind?: Kind7;
  run_id?: RunId7;
  session_id?: SessionId7;
  activation_id?: ActivationId7;
  durable_sequence?: DurableSequence7;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface InteractionSuspendedEnvelope {
  stream_epoch: StreamEpoch8;
  scope: LiveScope;
  scope_id: ScopeId8;
  live_sequence: LiveSequence8;
  kind?: Kind8;
  run_id?: RunId8;
  session_id?: SessionId8;
  activation_id?: ActivationId8;
  durable_sequence?: DurableSequence8;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface InteractionResolvedEnvelope {
  stream_epoch: StreamEpoch9;
  scope: LiveScope;
  scope_id: ScopeId9;
  live_sequence: LiveSequence9;
  kind?: Kind9;
  run_id?: RunId9;
  session_id?: SessionId9;
  activation_id?: ActivationId9;
  durable_sequence?: DurableSequence9;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface RunCancellationRequestedEnvelope {
  stream_epoch: StreamEpoch10;
  scope: LiveScope;
  scope_id: ScopeId10;
  live_sequence: LiveSequence10;
  kind?: Kind10;
  run_id?: RunId10;
  session_id?: SessionId10;
  activation_id?: ActivationId10;
  durable_sequence?: DurableSequence10;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface ActivationAbandonedEnvelope {
  stream_epoch: StreamEpoch11;
  scope: LiveScope;
  scope_id: ScopeId11;
  live_sequence: LiveSequence11;
  kind?: Kind11;
  run_id?: RunId11;
  session_id?: SessionId11;
  activation_id?: ActivationId11;
  durable_sequence?: DurableSequence11;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface RunTerminalEnvelope {
  stream_epoch: StreamEpoch12;
  scope: LiveScope;
  scope_id: ScopeId12;
  live_sequence: LiveSequence12;
  kind?: Kind12;
  run_id?: RunId12;
  session_id?: SessionId12;
  activation_id?: ActivationId12;
  durable_sequence?: DurableSequence12;
  payload: DurableEventPayload;
  lineage?: RunLineage | null;
}
export interface SessionControlChangedEnvelope {
  stream_epoch: StreamEpoch13;
  scope: LiveScope;
  scope_id: ScopeId13;
  live_sequence: LiveSequence13;
  kind?: Kind13;
  run_id?: RunId13;
  session_id?: SessionId13;
  activation_id?: ActivationId13;
  durable_sequence?: DurableSequence13;
  payload: ControlPayload;
  lineage?: RunLineage | null;
}
/**
 * 完整控制快照通知。
 */
export interface ControlPayload {
  snapshot: SessionControlSnapshot;
}
/**
 * 只读控制提示，revision 不参与 durable CAS。
 */
export interface SessionControlSnapshot {
  manager_id: ManagerId;
  revision: Revision;
  session_id: SessionId14;
  current_run_id?: CurrentRunId;
  run?: RunSnapshot | null;
  driver_state?: DriverState;
  pending?: Pending;
  allowed_commands?: AllowedCommands;
  pending_scope?: PendingScope;
  interaction_status?: InteractionStatus | null;
  [k: string]: unknown;
}
/**
 * 调用方可观察的 logical run 不可变快照。
 */
export interface RunSnapshot {
  run_id: RunId14;
  session_id: SessionId15;
  agent_id: AgentId;
  phase: RunPhase;
  stop_reason?: RunStopReason | null;
  revision: Revision1;
  current_activation_id?: CurrentActivationId;
  pending_interaction_id?: PendingInteractionId;
  cancellation_requested_at?: CancellationRequestedAt;
  cancellation_reason?: CancellationReason;
  limits: RunLimits;
  usage: RunUsage;
  checkpoint_sequence: CheckpointSequence;
  last_event_sequence: LastEventSequence;
  created_at: CreatedAt;
  started_at: StartedAt;
  updated_at: UpdatedAt;
  finished_at?: FinishedAt;
}
/**
 * 一次 logical run 的固定预算与截止约束。
 */
export interface RunLimits {
  max_model_steps?: MaxModelSteps;
  deadline_at?: DeadlineAt;
  interaction_timeout_seconds?: InteractionTimeoutSeconds;
}
/**
 * Logical run 已持久化的预算和 token 计数。
 */
export interface RunUsage {
  model_steps_reserved?: ModelStepsReserved;
  model_steps_committed?: ModelStepsCommitted;
  tool_calls_committed?: ToolCallsCommitted;
  input_tokens?: InputTokens;
  output_tokens?: OutputTokens;
  total_tokens?: TotalTokens;
  compaction?: TokenUsage;
}
/**
 * Provider 返回的一组独立 token 计数。
 */
export interface TokenUsage {
  input_tokens?: InputTokens1;
  output_tokens?: OutputTokens1;
  total_tokens?: TotalTokens1;
}
/**
 * 尚未完成投递的进程内输入；块序列使用 tuple 保持只读。
 */
export interface PendingSubmission {
  submission_id: SubmissionId;
  run_id: RunId15;
  mode: Mode;
  input: Input;
  stage: Stage;
  submitted_at: SubmittedAt;
  [k: string]: unknown;
}
/**
 * 用户或助手发送的纯文本内容。
 */
export interface TextBlock {
  type?: Type;
  text: Text;
  [k: string]: unknown;
}
/**
 * 图片的原始副本与模型副本引用，不携带请求编码。
 */
export interface ImageBlock {
  type?: Type1;
  original: ImageFileRef;
  model: ImageFileRef;
  name?: Name;
  [k: string]: unknown;
}
/**
 * 已保存图片的绝对路径、实际编码格式和像素尺寸。
 */
export interface ImageFileRef {
  path: Path;
  mime_type: MimeType;
  width: Width;
  height: Height;
  [k: string]: unknown;
}
export interface ConfigurationAppliedEnvelope {
  stream_epoch: StreamEpoch14;
  scope: LiveScope;
  scope_id: ScopeId14;
  live_sequence: LiveSequence14;
  kind?: Kind14;
  run_id?: RunId16;
  session_id?: SessionId16;
  activation_id?: ActivationId14;
  durable_sequence?: DurableSequence14;
  payload: ConfigurationPayload;
  lineage?: RunLineage | null;
}
/**
 * 完整配置事实的索引。
 */
export interface ConfigurationPayload {
  configuration_snapshot_id: ConfigurationSnapshotId;
  agent_id: AgentId1;
}
export interface ContextPreparationEnvelope {
  stream_epoch: StreamEpoch15;
  scope: LiveScope;
  scope_id: ScopeId15;
  live_sequence: LiveSequence15;
  kind?: Kind15;
  run_id?: RunId17;
  session_id?: SessionId17;
  activation_id?: ActivationId15;
  durable_sequence?: DurableSequence15;
  payload: PreparationPayload;
  lineage?: RunLineage | null;
}
/**
 * 准备退出时的摘要索引。
 */
export interface PreparationPayload {
  preparation_id: PreparationId;
  phase: Phase;
  step_index: StepIndex1;
  configuration_snapshot_id: ConfigurationSnapshotId1;
  stage_count: StageCount;
  final_input_tokens: FinalInputTokens;
}
export interface SourceAdoptedEnvelope {
  stream_epoch: StreamEpoch16;
  scope: LiveScope;
  scope_id: ScopeId16;
  live_sequence: LiveSequence16;
  kind?: Kind16;
  run_id?: RunId18;
  session_id?: SessionId18;
  activation_id?: ActivationId16;
  durable_sequence?: DurableSequence16;
  payload: SourcePayload;
  lineage?: RunLineage | null;
}
/**
 * 已采用来源的真实索引。
 */
export interface SourcePayload {
  adoption_id: AdoptionId;
  source_kind: SourceKind;
  owner_kind: OwnerKind;
  adoption_boundary: AdoptionBoundary;
  step_index: StepIndex2;
  preparation_id: PreparationId1;
  maintenance_cycle_id: MaintenanceCycleId;
  document_ids: DocumentIds;
}
export interface SubagentLinkedEnvelope {
  stream_epoch: StreamEpoch17;
  scope: LiveScope;
  scope_id: ScopeId17;
  live_sequence: LiveSequence17;
  kind?: Kind17;
  run_id?: RunId19;
  session_id?: SessionId19;
  activation_id?: ActivationId17;
  durable_sequence?: DurableSequence17;
  payload: LineagePayload;
  lineage?: RunLineage | null;
}
/**
 * 子任务固定归属。
 */
export interface LineagePayload {
  lineage: RunLineage;
}
export interface GoalChangedEnvelope {
  stream_epoch: StreamEpoch18;
  scope: LiveScope;
  scope_id: ScopeId18;
  live_sequence: LiveSequence18;
  kind?: Kind18;
  run_id?: RunId20;
  session_id?: SessionId20;
  activation_id?: ActivationId18;
  durable_sequence?: DurableSequence18;
  payload: GoalPayload;
  lineage?: RunLineage | null;
}
/**
 * 真实目标状态通知。
 */
export interface GoalPayload {
  view: GoalView;
}
/**
 * 持久事实与进程状态的统一只读投影。
 */
export interface GoalView {
  goal: GoalSnapshot | null;
  armed: Armed;
  run: RunSnapshot | null;
  run_goal_id: RunGoalId;
  interaction: HumanInteraction | null;
  settlement_pending: SettlementPending;
  driver_error: RunErrorInfo | null;
  [k: string]: unknown;
}
/**
 * 目标权威快照；不复制 Run 状态、使用量或进程 armed 标记。
 */
export interface GoalSnapshot {
  goal_id: GoalId;
  session_id: SessionId21;
  revision: Revision2;
  objective: Objective;
  status: GoalStatus;
  reason?: GoalReason | null;
  max_rounds: MaxRounds;
  rounds_started: RoundsStarted;
  run_options: AgentRunOptions;
  created_at: CreatedAt1;
  updated_at: UpdatedAt1;
}
/**
 * 供宿主解释状态变化的稳定原因码与正文。
 */
export interface GoalReason {
  code: Code;
  text: Text1;
}
/**
 * Logical run 的完整固定选项。
 */
export interface AgentRunOptions {
  limits?: RunLimits;
  runtime?: RuntimeExecutionOptions;
}
/**
 * 每次 activation 固定使用的 runtime 行为选项。
 */
export interface RuntimeExecutionOptions {
  include_tools?: IncludeTools;
  request_options?: RequestOptions;
  tool_timeout_seconds?: ToolTimeoutSeconds;
  tool_error_policy?: ToolErrorPolicy;
}
export interface RequestOptions {
  [k: string]: unknown;
}
/**
 * 持久化的一次人工 gate 与 response/close 状态。
 */
export interface HumanInteraction {
  interaction_id?: InteractionId;
  session_id: SessionId22;
  run_id: RunId21;
  step_index: StepIndex3;
  tool_call_id: ToolCallId;
  status?: InteractionStatus1;
  request: HumanInteractionRequest;
  response?: Response;
  version?: Version;
  created_at?: CreatedAt2;
  expires_at?: ExpiresAt;
  resolved_at?: ResolvedAt;
  closed_at?: ClosedAt;
  close_reason?: CloseReason;
}
/**
 * 所有人工 gate 共用的工具调用与提示信封。
 */
export interface HumanInteractionRequest {
  tool_call: ToolCallSnapshot;
  prompt: Prompt;
  subagent_origin?: SubagentProxyOrigin | null;
}
/**
 * 触发人工 gate 的精确工具调用身份。
 */
export interface ToolCallSnapshot {
  tool_call_id: ToolCallId1;
  tool_name: ToolName;
  arguments: Arguments;
  workspace_root: WorkspaceRoot;
  fingerprint: Fingerprint;
}
export interface Arguments {
  [k: string]: unknown;
}
/**
 * 向人展示的一次工具权限确认。
 */
export interface PermissionPrompt {
  kind?: Kind19;
  reason: Reason1;
}
/**
 * 向人展示的一次信息问题。
 */
export interface QuestionPrompt {
  kind?: Kind20;
  question: Question;
  options?: Options;
}
/**
 * Parent proxy 所对应的 exact child interaction 与期限归属。
 */
export interface SubagentProxyOrigin {
  child_run_id: ChildRunId1;
  child_interaction_id: ChildInteractionId;
  agent_selector: AgentSelector1;
  expiry_owner?: SubagentExpiryOwner | null;
}
/**
 * 人工对权限请求的单次决定。
 */
export interface PermissionInteractionResponse {
  kind?: Kind21;
  decision: Decision;
}
/**
 * 人工对问题请求的自由文本回答。
 */
export interface QuestionInteractionResponse {
  kind?: Kind22;
  answer: Answer;
}
/**
 * Logical run 对外返回的结构化错误。
 */
export interface RunErrorInfo {
  code: Code1;
  message: Message;
  source: Source;
  details?: Details;
}
export interface Details {
  [k: string]: unknown;
}
export interface MaintenanceChangedEnvelope {
  stream_epoch: StreamEpoch19;
  scope: LiveScope;
  scope_id: ScopeId19;
  live_sequence: LiveSequence19;
  kind?: Kind23;
  run_id?: RunId22;
  session_id?: SessionId23;
  activation_id?: ActivationId19;
  durable_sequence?: DurableSequence19;
  payload: MaintenancePayload;
  lineage?: RunLineage | null;
}
/**
 * 共享维护资源状态。
 */
export interface MaintenancePayload {
  coordinator_id: CoordinatorId;
  revision: Revision3;
  foreground_count: ForegroundCount;
  resource: ResourceMaintenanceView;
}
/**
 * 一个 Memory 或 Evolution 资源的当前调度事实。
 */
export interface ResourceMaintenanceView {
  resource_ref: ResourceRef;
  state: MaintenanceState;
  pending_request_id?: PendingRequestId;
  cycle_id?: CycleId;
  next_eligible_at?: NextEligibleAt;
  last_result_ref?: LastResultRef;
  pending_new_runs?: PendingNewRuns;
  min_pending_runs?: MinPendingRuns;
  [k: string]: unknown;
}
export interface CommandCleanupFailedEnvelope {
  stream_epoch: StreamEpoch20;
  scope: LiveScope;
  scope_id: ScopeId20;
  live_sequence: LiveSequence20;
  kind?: Kind24;
  run_id?: RunId23;
  session_id?: SessionId24;
  activation_id?: ActivationId20;
  durable_sequence?: DurableSequence20;
  payload: CleanupPayload;
  lineage?: RunLineage | null;
}
/**
 * 命令清理失败不伪装终态。
 */
export interface CleanupPayload {
  error: CleanupError;
}
/**
 * 命令清理失败的真实来源。
 */
export interface CleanupError {
  code: Code2;
  source: Source1;
  message: Message1;
}
export interface ModelResponseStartedEnvelope {
  stream_epoch: StreamEpoch21;
  scope: LiveScope;
  scope_id: ScopeId21;
  live_sequence: LiveSequence21;
  kind?: Kind25;
  run_id?: RunId24;
  session_id?: SessionId25;
  activation_id?: ActivationId21;
  durable_sequence?: DurableSequence21;
  payload: ModelStarted;
  lineage?: RunLineage | null;
}
/**
 * 模型响应开始。
 */
export interface ModelStarted {
  model_stream_id: ModelStreamId;
  provider_sequence: ProviderSequence;
  occurred_at: OccurredAt1;
  response_id: ResponseId;
}
export interface ModelBlockStartedEnvelope {
  stream_epoch: StreamEpoch22;
  scope: LiveScope;
  scope_id: ScopeId22;
  live_sequence: LiveSequence22;
  kind?: Kind26;
  run_id?: RunId25;
  session_id?: SessionId26;
  activation_id?: ActivationId22;
  durable_sequence?: DurableSequence22;
  payload: ModelBlock;
  lineage?: RunLineage | null;
}
/**
 * 模型输出块身份。
 */
export interface ModelBlock {
  model_stream_id: ModelStreamId1;
  provider_sequence: ProviderSequence1;
  occurred_at: OccurredAt2;
  block_index: BlockIndex;
  block_id: BlockId;
  block_kind: BlockKind;
  tool_call_id?: ToolCallId2;
}
export interface ModelBlockDeltaEnvelope {
  stream_epoch: StreamEpoch23;
  scope: LiveScope;
  scope_id: ScopeId23;
  live_sequence: LiveSequence23;
  kind?: Kind27;
  run_id?: RunId26;
  session_id?: SessionId27;
  activation_id?: ActivationId23;
  durable_sequence?: DurableSequence23;
  payload: ModelDelta;
  lineage?: RunLineage | null;
}
/**
 * 可合并快照；前端以 snapshot 覆盖。
 */
export interface ModelDelta {
  model_stream_id: ModelStreamId2;
  provider_sequence: ProviderSequence2;
  occurred_at: OccurredAt3;
  block_index: BlockIndex1;
  block_id: BlockId1;
  block_kind: BlockKind1;
  tool_call_id?: ToolCallId3;
  channel: Channel;
  delta: Delta;
  snapshot: Snapshot;
}
export interface ModelBlockCompletedEnvelope {
  stream_epoch: StreamEpoch24;
  scope: LiveScope;
  scope_id: ScopeId24;
  live_sequence: LiveSequence24;
  kind?: Kind28;
  run_id?: RunId27;
  session_id?: SessionId28;
  activation_id?: ActivationId24;
  durable_sequence?: DurableSequence24;
  payload: ModelBlock;
  lineage?: RunLineage | null;
}
export interface ModelUsageUpdatedEnvelope {
  stream_epoch: StreamEpoch25;
  scope: LiveScope;
  scope_id: ScopeId25;
  live_sequence: LiveSequence25;
  kind?: Kind29;
  run_id?: RunId28;
  session_id?: SessionId29;
  activation_id?: ActivationId25;
  durable_sequence?: DurableSequence25;
  payload: ModelUsage;
  lineage?: RunLineage | null;
}
/**
 * 实际用量更新。
 */
export interface ModelUsage {
  model_stream_id: ModelStreamId3;
  provider_sequence: ProviderSequence3;
  occurred_at: OccurredAt4;
  usage: LiveUsage;
}
/**
 * 模型实际报告的用量。
 */
export interface LiveUsage {
  input_tokens: InputTokens2;
  output_tokens: OutputTokens2;
  total_tokens: TotalTokens2;
  complete?: Complete;
}
export interface ModelResponseCompletedEnvelope {
  stream_epoch: StreamEpoch26;
  scope: LiveScope;
  scope_id: ScopeId26;
  live_sequence: LiveSequence26;
  kind?: Kind30;
  run_id?: RunId29;
  session_id?: SessionId30;
  activation_id?: ActivationId26;
  durable_sequence?: DurableSequence26;
  payload: ModelCompleted;
  lineage?: RunLineage | null;
}
/**
 * 模型完成不代表 durable 消息提交。
 */
export interface ModelCompleted {
  model_stream_id: ModelStreamId4;
  provider_sequence: ProviderSequence4;
  occurred_at: OccurredAt5;
  provider: Provider;
  model: Model;
  response_id: ResponseId1;
  finish_reason: FinishReason;
  usage: LiveUsage;
  semantic_output_emitted: SemanticOutputEmitted;
}
export interface ModelResponseFailedEnvelope {
  stream_epoch: StreamEpoch27;
  scope: LiveScope;
  scope_id: ScopeId27;
  live_sequence: LiveSequence27;
  kind?: Kind31;
  run_id?: RunId30;
  session_id?: SessionId31;
  activation_id?: ActivationId27;
  durable_sequence?: DurableSequence27;
  payload: ModelFailed;
  lineage?: RunLineage | null;
}
/**
 * 模型流错误。
 */
export interface ModelFailed {
  model_stream_id: ModelStreamId5;
  provider_sequence: ProviderSequence5;
  occurred_at: OccurredAt6;
  error: LiveError;
  semantic_output_emitted: SemanticOutputEmitted1;
}
/**
 * 轻量运行错误。
 */
export interface LiveError {
  code: Code3;
  message: Message2;
  retryable: Retryable;
}
export interface ModelResponseCancelledEnvelope {
  stream_epoch: StreamEpoch28;
  scope: LiveScope;
  scope_id: ScopeId28;
  live_sequence: LiveSequence28;
  kind?: Kind32;
  run_id?: RunId31;
  session_id?: SessionId32;
  activation_id?: ActivationId28;
  durable_sequence?: DurableSequence28;
  payload: ModelCancelled;
  lineage?: RunLineage | null;
}
/**
 * 模型取消。
 */
export interface ModelCancelled {
  model_stream_id: ModelStreamId6;
  provider_sequence: ProviderSequence6;
  occurred_at: OccurredAt7;
  error?: LiveError | null;
  semantic_output_emitted: SemanticOutputEmitted2;
}
export interface ModelStepStartedEnvelope {
  stream_epoch: StreamEpoch29;
  scope: LiveScope;
  scope_id: ScopeId29;
  live_sequence: LiveSequence29;
  kind?: Kind33;
  run_id?: RunId32;
  session_id?: SessionId33;
  activation_id?: ActivationId29;
  durable_sequence?: DurableSequence29;
  payload: StepPayload;
  lineage?: RunLineage | null;
}
/**
 * 模型或压缩步骤通知。
 */
export interface StepPayload {
  step_index: StepIndex4;
}
export interface ToolPreparingEnvelope {
  stream_epoch: StreamEpoch30;
  scope: LiveScope;
  scope_id: ScopeId30;
  live_sequence: LiveSequence30;
  kind?: Kind34;
  run_id?: RunId33;
  session_id?: SessionId34;
  activation_id?: ActivationId30;
  durable_sequence?: DurableSequence30;
  payload: ToolPayload;
  lineage?: RunLineage | null;
}
/**
 * 工具执行摘要身份。
 */
export interface ToolPayload {
  tool_call_id: ToolCallId4;
  tool_name: ToolName1;
  tool_ordinal: ToolOrdinal;
}
export interface ToolStartedEnvelope {
  stream_epoch: StreamEpoch31;
  scope: LiveScope;
  scope_id: ScopeId31;
  live_sequence: LiveSequence31;
  kind?: Kind35;
  run_id?: RunId34;
  session_id?: SessionId35;
  activation_id?: ActivationId31;
  durable_sequence?: DurableSequence31;
  payload: ToolPayload;
  lineage?: RunLineage | null;
}
export interface ToolCompletedEnvelope {
  stream_epoch: StreamEpoch32;
  scope: LiveScope;
  scope_id: ScopeId32;
  live_sequence: LiveSequence32;
  kind?: Kind36;
  run_id?: RunId35;
  session_id?: SessionId36;
  activation_id?: ActivationId32;
  durable_sequence?: DurableSequence32;
  payload: ToolCompleted;
  lineage?: RunLineage | null;
}
/**
 * 完整结果仍从 HTTP 读取。
 */
export interface ToolCompleted {
  tool_call_id: ToolCallId5;
  tool_name: ToolName2;
  tool_ordinal: ToolOrdinal1;
  content: Content;
  is_error: IsError;
  error?: LiveError | null;
  artifact?: Artifact;
  file_change?: FileChange;
}
export interface ContextCompactionStartedEnvelope {
  stream_epoch: StreamEpoch33;
  scope: LiveScope;
  scope_id: ScopeId33;
  live_sequence: LiveSequence33;
  kind?: Kind37;
  run_id?: RunId36;
  session_id?: SessionId37;
  activation_id?: ActivationId33;
  durable_sequence?: DurableSequence33;
  payload: StepPayload;
  lineage?: RunLineage | null;
}
export interface ContextCompactionCompletedEnvelope {
  stream_epoch: StreamEpoch34;
  scope: LiveScope;
  scope_id: ScopeId34;
  live_sequence: LiveSequence34;
  kind?: Kind38;
  run_id?: RunId37;
  session_id?: SessionId38;
  activation_id?: ActivationId34;
  durable_sequence?: DurableSequence34;
  payload: StepPayload;
  lineage?: RunLineage | null;
}
export interface ContextCompactionFailedEnvelope {
  stream_epoch: StreamEpoch35;
  scope: LiveScope;
  scope_id: ScopeId35;
  live_sequence: LiveSequence35;
  kind?: Kind39;
  run_id?: RunId38;
  session_id?: SessionId39;
  activation_id?: ActivationId35;
  durable_sequence?: DurableSequence35;
  payload: StepPayload;
  lineage?: RunLineage | null;
}
export interface SubmissionPendingEnvelope {
  stream_epoch: StreamEpoch36;
  scope: LiveScope;
  scope_id: ScopeId36;
  live_sequence: LiveSequence36;
  kind?: Kind40;
  run_id?: RunId39;
  session_id?: SessionId40;
  activation_id?: ActivationId36;
  durable_sequence?: DurableSequence36;
  payload: SubmissionPayload;
  lineage?: RunLineage | null;
}
/**
 * 输入投递通知。
 */
export interface SubmissionPayload {
  submission_id: SubmissionId1;
  mode: Mode1;
  state: State;
  reason?: Reason2;
}
export interface SubmissionDeliveredEnvelope {
  stream_epoch: StreamEpoch37;
  scope: LiveScope;
  scope_id: ScopeId37;
  live_sequence: LiveSequence37;
  kind?: Kind41;
  run_id?: RunId40;
  session_id?: SessionId41;
  activation_id?: ActivationId37;
  durable_sequence?: DurableSequence37;
  payload: SubmissionPayload;
  lineage?: RunLineage | null;
}
export interface SubmissionFailedEnvelope {
  stream_epoch: StreamEpoch38;
  scope: LiveScope;
  scope_id: ScopeId38;
  live_sequence: LiveSequence38;
  kind?: Kind42;
  run_id?: RunId41;
  session_id?: SessionId42;
  activation_id?: ActivationId38;
  durable_sequence?: DurableSequence38;
  payload: SubmissionPayload;
  lineage?: RunLineage | null;
}
/**
 * 说明 live replay 或 delivery 出现需要 durable sync 的缺口。
 */
export interface ReplayGap {
  kind?: Kind43;
  reason: ReplayGapReason;
  requested_cursor?: LiveCursor | null;
  current_epoch: CurrentEpoch;
}
/**
 * 一个 epoch 内特定 scope 的 live replay cursor。
 */
export interface LiveCursor {
  stream_epoch: StreamEpoch39;
  scope: LiveScope;
  scope_id: ScopeId39;
  after_live_sequence: AfterLiveSequence;
}
/**
 * 结束单个 live subscription 的安全 control item。
 */
export interface SubscriptionTerminal {
  kind?: Kind44;
  reason: SubscriptionTerminalReason;
  message: Message3;
}
/**
 * 订阅已登记的首帧。
 */
export interface StreamReady {
  connection_id: ConnectionId;
  backend_epoch: BackendEpoch;
  store_binding_id: StoreBindingId;
  source_id: SourceId;
  resource_id: ResourceId;
  stream_epoch: StreamEpoch40;
  scope: Scope;
  scope_id: ScopeId40;
}
