import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FactList } from '../src/features/inspection/FactView';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('resource identities', () => {
  for (const [idField, item, expected] of [
    ['id', { id: 'item-real', text: '知识' }, 'item-real'],
    [
      'observation.id',
      { observation: { id: 'observation-real', text: '观察' } },
      'observation-real',
    ],
  ] as const)
    it(`uses ${idField} for the detail request`, async () => {
      const fetchMock = vi.fn(async (url: string) =>
        Response.json(url === '/api/list' ? { items: [item], next_cursor: null } : item),
      );
      vi.stubGlobal('fetch', fetchMock);
      render(
        <QueryClientProvider client={new QueryClient()}>
          <FactList path="/api/list" detailPath="/api/detail" idField={idField} />
        </QueryClientProvider>,
      );
      fireEvent.click(await screen.findByRole('button', { name: expected }));
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(`/api/detail/${expected}`, expect.anything()),
      );
      expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/0'))).toBe(false);
    });
});
