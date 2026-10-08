import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Inspector } from '../src/features/inspection/Inspector';
import { initialSessionState } from '../src/streams/reducer';
import type { SessionBootstrap } from '../src/api/types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('offers run selection for cold durable history without claiming the session has never run', () => {
  const session = { store_binding_id: 'store', source_id: 'source', session_id: 'history' };
  const bootstrap: SessionBootstrap = {
    session: {
      ref: session,
      title: '已结束会话',
      generation_id: null,
      has_durable_state: true,
      forked_from_run_id: null,
    },
    control: null,
    lane: { session, run_id: null, run: null },
    current_run: null,
    messages: {
      items: [
        {
          ordinal: 0,
          role: 'user',
          sender: 'user',
          timestamp: 0,
          parts: [{ type: 'text', text: '已有的持久消息' }],
          metadata: {},
        },
      ],
      total_count: 1,
      next_index: null,
    },
    event_watermarks: [],
  };
  const openHistory = vi.fn();
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(
    <Inspector
      kind="runtime"
      session={session}
      generation={null}
      state={{ ...initialSessionState, bootstrap, messages: bootstrap.messages.items }}
      observedRun={null}
      recentRun={null}
      selectCurrent={() => {}}
      configure={() => {}}
      records={() => {}}
      openHistory={openHistory}
    />,
  );
  expect(screen.getByText('选择要观察的运行')).toBeTruthy();
  expect(screen.queryByText('还没有运行记录')).toBeNull();
  expect(screen.queryByText(/发送第一条消息后/)).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '查看运行历史' }));
  expect(openHistory).toHaveBeenCalledTimes(1);
});
