import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { ReactNode } from 'react';
import { useSession } from '../src/streams/useSession';
import type { SessionBootstrap } from '../src/api/types';

afterEach(() => vi.unstubAllGlobals());
const session = { store_binding_id: 'store-a', source_id: 'source-a', session_id: 'session-a' };
const empty: SessionBootstrap = {
  session: {
    ref: session,
    title: '会话',
    generation_id: 'generation-a',
    has_durable_state: false,
    forked_from_run_id: null,
  },
  control: null,
  lane: { session, run_id: null, run: null },
  current_run: null,
  messages: { items: [], next_index: null, total_count: 0 },
  event_watermarks: [],
};
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('session subscribe and bootstrap', () => {
  it('refreshes app state and drops old configuration cache after a backend epoch change', async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        stream = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/stream') ? new Response(body) : Response.json(empty),
      ),
    );
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { unmount } = renderHook(() => useSession(session), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    const ready = (backend: string): void =>
      stream.enqueue(
        new TextEncoder().encode(
          `event: stream.ready\ndata: {"stream_epoch":"${backend}","backend_epoch":"${backend}"}\n\n`,
        ),
      );
    await act(async () => ready('backend-A'));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['app'] });
    client.setQueryData(['configuration', 'old-generation'], { old: true });
    await act(async () => ready('backend-B'));
    expect(client.getQueryData(['configuration', 'old-generation'])).toBeUndefined();
    expect(invalidate.mock.calls.filter(([value]) => value?.queryKey?.[0] === 'app')).toHaveLength(
      2,
    );
    unmount();
    stream.close();
  });
  it('uses the real stream route and waits for stream.ready before bootstrap', async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        stream = controller;
      },
    });
    const fetchMock = vi.fn(async (url: string) =>
      url.endsWith('/stream') ? new Response(body) : Response.json(empty),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result, unmount } = renderHook(() => useSession(session), { wrapper });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/stores/store-a/sessions/session-a/stream',
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () =>
      stream.enqueue(
        new TextEncoder().encode('event: stream.ready\ndata: {"stream_epoch":"epoch-a"}\n\n'),
      ),
    );
    await waitFor(() => expect(result.current.state.bootstrap?.session.title).toBe('会话'));
    expect((fetchMock as Mock).mock.calls[1][0]).toBe(
      '/api/stores/store-a/sessions/session-a/bootstrap',
    );
    expect(result.current.connection).toBe('connected');
    unmount();
    stream.close();
  });
  it('buffers model snapshots during bootstrap without appending duplicate text', async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    let resolveBootstrap!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveBootstrap = resolve;
    });
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        stream = controller;
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.endsWith('/stream') ? Promise.resolve(new Response(body)) : pending,
      ),
    );
    const { result, unmount } = renderHook(() => useSession(session), { wrapper });
    const push = (event: string, data: unknown): void =>
      stream.enqueue(
        new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
      );
    await act(async () => {
      push('stream.ready', { stream_epoch: 'epoch-a' });
      for (const [index, snapshot] of ['你', '你好'].entries())
        push('model.block.delta', {
          stream_epoch: 'epoch-a',
          scope: 'session_tree',
          scope_id: 'session-a',
          live_sequence: index + 1,
          kind: 'model.block.delta',
          run_id: 'run-a',
          session_id: 'session-a',
          activation_id: 'activation-a',
          payload: {
            model_stream_id: 'stream-a',
            block_id: 'text-a',
            block_kind: 'text',
            channel: 'text',
            snapshot,
            delta: snapshot,
          },
        });
    });
    expect(result.current.state.blocks).toEqual({});
    await act(async () => resolveBootstrap(Response.json(empty)));
    await waitFor(() => expect(Object.values(result.current.state.blocks)[0]?.text).toBe('你好'));
    expect(Object.keys(result.current.state.blocks)).toHaveLength(1);
    unmount();
    stream.close();
  });
});
