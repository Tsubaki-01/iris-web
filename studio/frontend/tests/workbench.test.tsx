import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Workbench } from '../src/app/Workbench';
import { observations } from '../src/features/inspection/Inspector';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('clean three-column workspace', () => {
  it('switches all nine observations without remounting or clearing the composer', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        backend_epoch: 'epoch',
        workspaces: [],
        profiles: [],
        generations: [],
        storage_bindings: [],
        default_profile_id: null,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <Workbench />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const composer = screen.getByRole('textbox', { name: '输入任务' });
    fireEvent.change(composer, { target: { value: '尚未发送的草稿' } });
    for (const [, title] of observations) {
      fireEvent.click(screen.getByRole('button', { name: title }));
      expect(screen.getByRole('textbox', { name: '输入任务' })).toBe(composer);
      expect((composer as HTMLTextAreaElement).value).toBe('尚未发送的草稿');
    }
    expect(screen.getByRole('button', { name: '发送' }).hasAttribute('disabled')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
