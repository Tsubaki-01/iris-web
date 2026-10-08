import { describe, expect, it } from 'vitest';
import type { UiMessage } from '../src/api/types';
import type { ModelBlockDeltaEnvelope } from '../src/api/generated/sse';
import { initialSessionState, mergeMessages, sessionReducer } from '../src/streams/reducer';

const event = (changes: Partial<ModelBlockDeltaEnvelope> = {}): ModelBlockDeltaEnvelope => ({
  stream_epoch: 'e',
  scope: 'session_tree',
  scope_id: 'parent',
  live_sequence: 1,
  kind: 'model.block.delta',
  run_id: 'run',
  session_id: 'parent',
  activation_id: 'a',
  durable_sequence: null,
  lineage: null,
  payload: {
    model_stream_id: 'm',
    provider_sequence: 1,
    occurred_at: '2026-10-08T00:00:00Z',
    block_index: 0,
    block_id: 'b',
    block_kind: 'text',
    channel: 'text',
    snapshot: '你好',
    delta: '你好',
  },
  ...changes,
});

describe('session projection', () => {
  it('ignores a delayed history page after switching the exact session', async () => {
    const message = {
      ordinal: 0,
      role: 'user',
      sender: 'user',
      timestamp: 0,
      parts: [{ type: 'text', text: 'B 的消息' }],
      metadata: {},
    } as UiMessage;
    let state = sessionReducer(initialSessionState, {
      type: 'reset',
      sessionKey: '/stores/A/sessions/same',
    });
    let resolve!: (messages: UiMessage[]) => void;
    const delayed = new Promise<UiMessage[]>((done) => {
      resolve = done;
    }).then((messages) => {
      state = sessionReducer(state, {
        type: 'history',
        sessionKey: '/stores/A/sessions/same',
        messages,
      });
    });
    state = sessionReducer(state, { type: 'reset', sessionKey: '/stores/B/sessions/same' });
    state = sessionReducer(state, {
      type: 'history',
      sessionKey: '/stores/B/sessions/same',
      messages: [message],
    });
    resolve([{ ...message, parts: [{ type: 'text', text: 'A 的迟到消息' }] }]);
    await delayed;
    expect(state.messages).toEqual([message]);
  });
  it('replaces snapshots and rejects replayed envelopes', () => {
    const once = sessionReducer(initialSessionState, {
      type: 'live',
      envelope: event(),
      sessionId: 'parent',
    });
    const twice = sessionReducer(once, {
      type: 'live',
      envelope: event({ live_sequence: 2, payload: { ...event().payload, snapshot: '你好世界' } }),
      sessionId: 'parent',
    });
    expect(Object.values(twice.blocks)[0].text).toBe('你好世界');
    expect(sessionReducer(twice, { type: 'live', envelope: event(), sessionId: 'parent' })).toBe(
      twice,
    );
  });
  it('keeps child streams outside the parent answer and resets on a new epoch', () => {
    const parent = sessionReducer(initialSessionState, {
      type: 'live',
      envelope: event(),
      sessionId: 'parent',
    });
    const child = sessionReducer(parent, {
      type: 'live',
      envelope: event({ live_sequence: 2, session_id: 'child' }),
      sessionId: 'parent',
    });
    expect(Object.keys(child.blocks)).toHaveLength(1);
    const restarted = sessionReducer(child, {
      type: 'live',
      envelope: event({ stream_epoch: 'new', session_id: 'child' }),
      sessionId: 'parent',
    });
    expect(restarted.blocks).toEqual({});
  });
  it('uses absolute ordinals instead of text to merge durable messages', () => {
    const message = {
      ordinal: 1,
      role: 'user',
      sender: 'user',
      timestamp: 0,
      parts: [{ type: 'text', text: '同一句话' }],
      metadata: {},
    } as UiMessage;
    const merged = mergeMessages([message], [message, { ...message, ordinal: 2 }]);
    expect(merged.map((value) => value.ordinal)).toEqual([1, 2]);
  });
  it('shows the actual thinking channel emitted by Iris', () => {
    const result = sessionReducer(initialSessionState, {
      type: 'live',
      sessionId: 'parent',
      envelope: event({
        payload: {
          ...event().payload,
          block_kind: 'thinking',
          channel: 'thinking',
          snapshot: '正在分析',
          delta: '正在分析',
        },
      }),
    });
    expect(Object.values(result.blocks)[0]).toMatchObject({
      channel: 'thinking',
      text: '正在分析',
    });
  });
});
