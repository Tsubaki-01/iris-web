import { useState, type ReactNode } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { request } from '../../api/client';
import { Button, EmptyState, ErrorNotice, Loading } from '../../components/Primitives';

/** 各领域共享分页读取，标题和正文仍由对应领域组件拥有。 */
export function RecordList<T>({
  path,
  identify,
  summary,
  detail,
  paginated = true,
}: {
  path: string;
  identify: (item: T) => string;
  summary: (item: T) => ReactNode;
  detail: (item: T) => ReactNode;
  paginated?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const query = useInfiniteQuery({
    queryKey: ['inspection', path],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: T[]; next_cursor?: string | null }>(
        `${path}${pageParam ? `${path.includes('?') ? '&' : '?'}after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => (paginated ? (page.next_cursor ?? undefined) : undefined),
  });
  return (
    <>
      <ErrorNotice error={query.error} />
      {query.isLoading && <Loading />}
      {query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => {
          const id = identify(item);
          return (
            <article className="record-card" key={id}>
              <button
                className="record-heading semantic-heading"
                aria-expanded={selected === id}
                onClick={() => setSelected(selected === id ? null : id)}
              >
                {summary(item)}
              </button>
              {selected === id && <div className="record-detail">{detail(item)}</div>}
            </article>
          );
        })}
      {query.data?.pages[0].items.length === 0 && (
        <EmptyState title="暂无记录">对应能力产生真实记录后会显示在这里。</EmptyState>
      )}
      {query.hasNextPage && (
        <Button disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
          加载更多
        </Button>
      )}
    </>
  );
}

export function RemoteRecord<T>({
  path,
  children,
}: {
  path: string;
  children: (value: T) => ReactNode;
}) {
  const query = useQuery({ queryKey: ['inspection', path], queryFn: () => request<T>(path) });
  return (
    <>
      <ErrorNotice error={query.error} />
      {query.isLoading && <Loading />}
      {query.data !== undefined && children(query.data)}
    </>
  );
}
