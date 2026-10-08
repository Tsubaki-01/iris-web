import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Workbench } from '../src/app/Workbench';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  history.replaceState(null, '', '/');
});
const app = {
  backend_epoch: 'backend',
  workspaces: [],
  profiles: [],
  generations: [],
  storage_bindings: [],
  default_profile_id: null,
};

it('restores the exact URL session through reads without attach, restore, or submit mutations', async () => {
  history.replaceState(null, '', '/?store=store-a&session=session-a');
  const ref = { store_binding_id: 'store-a', source_id: 'source-a', session_id: 'session-a' };
  const session = {
    ref,
    title: '刷新前的会话',
    generation_id: null,
    has_durable_state: true,
    forked_from_run_id: null,
  };
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream = controller;
      controller.enqueue(
        new TextEncoder().encode(
          'event: stream.ready\ndata: {"stream_epoch":"epoch","backend_epoch":"backend"}\n\n',
        ),
      );
    },
  });
  const fetchMock = vi.fn(async (path: string) => {
    if (path === '/api/bootstrap') return Response.json(app);
    if (path.endsWith('/stream')) return new Response(body);
    if (path.endsWith('/bootstrap'))
      return Response.json({
        session,
        control: null,
        lane: { session: ref, run_id: null, run: null },
        current_run: null,
        messages: { items: [], next_index: null, total_count: 0 },
        event_watermarks: [],
      });
    return Response.json(session);
  });
  vi.stubGlobal('fetch', fetchMock);
  const { unmount } = render(
    <QueryClientProvider client={new QueryClient()}>
      <Workbench />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole('heading', { name: '刷新前的会话' })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/stores/store-a/sessions/session-a',
    expect.anything(),
  );
  expect(fetchMock.mock.calls.some(([path]) => /\/(restore|attach|inputs)$/.test(path))).toBe(
    false,
  );
  unmount();
  stream.close();
});

it('offers a separate session picker when the compact sidebar hides recent rows', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(app)),
  );
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Workbench />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByRole('button', { name: '会话列表' })).toBeTruthy());
  fireEvent.click(screen.getByRole('button', { name: '会话列表' }));
  expect(await screen.findByRole('dialog')).toBeTruthy();
  expect(screen.getByText('选择 Agent 后可创建新会话。')).toBeTruthy();
});
