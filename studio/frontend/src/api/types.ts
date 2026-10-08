import type { components } from './generated/http';
import type { StudioSse } from './generated/sse';

export type Schema = components['schemas'];
export type SessionRef = Schema['SessionRef'];
export type SessionView = Schema['SessionView'];
export type GenerationView = Schema['GenerationView'];
export type ProfileView = Schema['ProfileView'];
export type SessionBootstrap = Schema['SessionBootstrap'];
export type UiMessage = Schema['UiMessage'];
export type UiPart = UiMessage['parts'][number];
export type MediaView = Schema['MediaView'];
export type ConfigDraft = Schema['ConfigDraft'];
export type ConfigValidation = Schema['ConfigValidation'];
export type OperationAccepted = Schema['OperationAccepted'];
export type OperationView = Schema['OperationView'];
export type Control = NonNullable<SessionBootstrap['control']>;
export type Run = NonNullable<SessionBootstrap['current_run']>['run'];
export type ResourceRef = NonNullable<GenerationView['resource_refs']>[number];
export type LiveEnvelope = Extract<StudioSse, { live_sequence: number }>;

/** 仅供通用事实查看器使用；协议 DTO 始终来自生成的 schema。 */
export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
