import { useInfiniteQuery } from '@tanstack/react-query';
import { request } from '../../api/client';
import type { Schema, SessionRef } from '../../api/types';
import { Button, ErrorNotice } from '../../components/Primitives';

type StorePage = Schema['WorkspaceSessions']['stores'][number];
export function StoreSessions({
  store,
  selected,
  open,
}: {
  store: StorePage;
  selected: SessionRef | null;
  open: (ref: SessionRef) => Promise<void>;
}) {
  const query = useInfiniteQuery({
    queryKey: ['sessions', 'store', store.store_binding_id],
    initialPageParam: '',
    initialData: { pages: [store.page], pageParams: [''] },
    queryFn: ({ pageParam }) =>
      request<StorePage['page']>(
        `/api/stores/${store.store_binding_id}/sessions?limit=50${pageParam ? `&after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  return (
    <>
      <ErrorNotice error={query.error} />
      {query.data.pages
        .flatMap((page) => page.items)
        .map((summary) => (
          <button
            key={summary.session_id}
            className={
              summary.session_id === selected?.session_id &&
              store.store_binding_id === selected.store_binding_id
                ? 'current'
                : ''
            }
            onClick={() =>
              void open({
                store_binding_id: store.store_binding_id,
                source_id: store.source_id,
                session_id: summary.session_id,
              })
            }
            title={summary.session_id}
          >
            {summary.current_run_id ? '◌ ' : ''}
            {summary.session_id.slice(0, 18)}
            <small>{summary.message_count} 条消息</small>
          </button>
        ))}
      {query.hasNextPage && (
        <Button disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
          更早会话
        </Button>
      )}
    </>
  );
}
