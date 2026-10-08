import type { LiveEnvelope, Control, SessionBootstrap, UiMessage } from '../api/types';

export interface LiveBlock {
  key: string;
  runId: string;
  streamId: string;
  channel: string;
  text: string;
}
export interface SessionState {
  sessionKey: string | null;
  bootstrap: SessionBootstrap | null;
  control: Control | null;
  messages: UiMessage[];
  blocks: Record<string, LiveBlock>;
  epoch: string | null;
  liveSequence: number;
}
export const initialSessionState: SessionState = {
  sessionKey: null,
  bootstrap: null,
  control: null,
  messages: [],
  blocks: {},
  epoch: null,
  liveSequence: 0,
};
export type SessionAction =
  | { type: 'reset'; sessionKey: string | null }
  | { type: 'snapshot'; value: SessionBootstrap }
  | { type: 'history'; sessionKey: string; messages: UiMessage[] }
  | { type: 'gap' }
  | { type: 'ready'; epoch: string }
  | { type: 'live'; envelope: LiveEnvelope; sessionId: string };

export function mergeMessages(old: UiMessage[], incoming: UiMessage[]): UiMessage[] {
  const map = new Map(old.map((message) => [message.ordinal, message]));
  incoming.forEach((message) => map.set(message.ordinal, message));
  return [...map.values()].sort((a, b) => a.ordinal - b.ordinal);
}

function newerControl(current: Control | null, incoming: Control | null): Control | null {
  if (!incoming) return null;
  if (current?.manager_id === incoming.manager_id && current.revision > incoming.revision)
    return current;
  return incoming;
}

/** Live 仅承载临时文字；持久消息始终按绝对 ordinal 对齐。 */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'reset') return { ...initialSessionState, sessionKey: action.sessionKey };
  if (action.type === 'gap') return { ...state, blocks: {}, liveSequence: 0 };
  if (action.type === 'ready')
    return state.epoch === action.epoch
      ? state
      : { ...state, epoch: action.epoch, liveSequence: 0, blocks: {}, control: null };
  if (action.type === 'history')
    return action.sessionKey === state.sessionKey
      ? { ...state, messages: mergeMessages(state.messages, action.messages) }
      : state;
  if (action.type === 'snapshot') {
    const value = action.value;
    return {
      ...state,
      bootstrap: value,
      control: newerControl(state.control, value.control),
      messages: mergeMessages(state.messages, value.messages.items),
      blocks: !value.lane.run_id ? {} : state.blocks,
    };
  }
  const event = action.envelope;
  const sameEpoch = state.epoch === event.stream_epoch;
  if (sameEpoch && event.live_sequence <= state.liveSequence) return state;
  const next: SessionState = {
    ...state,
    epoch: event.stream_epoch,
    liveSequence: event.live_sequence,
    blocks: sameEpoch ? state.blocks : {},
    control: sameEpoch ? state.control : null,
  };
  if (event.session_id !== action.sessionId) return next;
  if (event.kind === 'model_step.committed' || event.kind === 'run.terminal')
    return { ...next, blocks: {} };
  if (event.kind === 'session.control.changed')
    return { ...next, control: newerControl(next.control, event.payload.snapshot as Control) };
  if (event.kind !== 'model.block.delta') return next;
  const payload = event.payload;
  if (payload.block_kind !== 'text' && payload.channel !== 'thinking') return next;
  const streamId = String(payload.model_stream_id);
  const channel = String(payload.channel);
  const key = [event.run_id, event.activation_id, streamId, payload.block_id, channel].join(':');
  const text =
    typeof payload.snapshot === 'string'
      ? payload.snapshot
      : (next.blocks[key]?.text ?? '') + String(payload.delta ?? '');
  return {
    ...next,
    blocks: { ...next.blocks, [key]: { key, runId: event.run_id ?? '', streamId, channel, text } },
  };
}
