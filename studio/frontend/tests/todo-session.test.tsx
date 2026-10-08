import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { Inspector } from '../src/features/inspection/Inspector';
import { initialSessionState } from '../src/streams/reducer';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('does not write an unsaved Todo draft into another session with the same base text', async () => {
  const writes: { path: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (path: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        writes.push({ path, body: JSON.parse(String(init.body)) });
        return Response.json({});
      }
      if (path.endsWith('/goal'))
        return Response.json({ status: 'disabled', reason: '未启用', data: null });
      if (path.endsWith('/todo/document'))
        return Response.json({
          status: 'available',
          data: {
            path: 'todo.md',
            text: '',
            snapshot: { path: 'todo.md', items: [], error: null },
          },
        });
      return Response.json({
        status: 'available',
        data: { path: 'todo.md', items: [], error: null },
      });
    }),
  );
  const client = new QueryClient();
  const ui = (id: string) => (
    <QueryClientProvider client={client}>
      <Inspector
        kind="goals"
        session={{ store_binding_id: 'store', source_id: 'source', session_id: id }}
        generation={null}
        state={initialSessionState}
        observedRun={null}
        recentRun={null}
        selectCurrent={() => {}}
        configure={() => {}}
        records={() => {}}
        openHistory={() => {}}
      />
    </QueryClientProvider>
  );
  const { rerender } = render(ui('A'));
  fireEvent.change(await screen.findByLabelText('Todo Markdown'), {
    target: { value: '- [ ] A 未保存' },
  });
  rerender(ui('B'));
  const input = await screen.findByLabelText('Todo Markdown');
  await waitFor(() => expect((input as HTMLTextAreaElement).value).toBe(''));
  expect(
    screen.getByRole('button', { name: '保存清单', hidden: true }).hasAttribute('disabled'),
  ).toBe(true);
  fireEvent.change(input, { target: { value: '- [ ] B 的待办' } });
  fireEvent.click(screen.getByRole('button', { name: '保存清单', hidden: true }));
  await waitFor(() => expect(writes).toHaveLength(1));
  expect(writes[0]).toEqual({
    path: '/api/stores/store/sessions/B/todo',
    body: { base_text: '', text: '- [ ] B 的待办' },
  });
});
