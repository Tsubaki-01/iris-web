import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { request } from '../../api/client';
import type { JsonValue } from '../../api/types';
import { Button, EmptyState, ErrorNotice, JsonDetails, Loading } from '../../components/Primitives';

const labels: Record<string, string> = {
  status: '状态',
  reason: '说明',
  phase: '运行状态',
  created_at: '创建时间',
  updated_at: '更新时间',
  title: '标题',
  summary: '摘要',
  description: '描述',
  text: '正文',
  input_tokens: '输入 tokens',
  output_tokens: '输出 tokens',
  pending_new_runs: '合格新 Run',
  min_pending_runs: '触发门槛',
  foreground_count: '前台占用',
  next_eligible_at: '下次合格时间',
  publication_state: '发布确认',
  detail_status: '详情状态',
  objective: '目标',
  rounds_started: '已开始轮数',
  max_rounds: '轮数上限',
  armed: '自动推进',
  state: '状态',
  error: '错误',
  final_input_tokens: '最终输入 tokens',
};
const statusLabels: Record<string, string> = {
  disabled: '未启用',
  not_triggered: '尚未触发',
  not_collected: '未采集',
  expired: '详情已过期',
  waiting_for_materials: '等待材料',
  waiting_for_foreground: '等待前台空闲',
  waiting_for_idle: '等待空闲期限',
  waiting_for_lock: '等待资源锁',
  available: '可用',
  confirmed: '已确认',
  unconfirmed: '未确认',
};

/** 通用事实呈现只格式化已返回字段，不补造缺失值。 */
export function FactValue({ value }: { value: JsonValue }) {
  if (value === null) return <span className="muted">未记录</span>;
  if (typeof value === 'string')
    return <span className="fact-text">{statusLabels[value] ?? value}</span>;
  if (typeof value !== 'object')
    return <span>{typeof value === 'boolean' ? (value ? '是' : '否') : value}</span>;
  if (Array.isArray(value))
    return value.length ? (
      <div className="fact-list">
        {value.map((item, index) => (
          <div key={index}>
            <FactValue value={item} />
          </div>
        ))}
      </div>
    ) : (
      <span className="muted">暂无记录</span>
    );
  if ('status' in value && 'data' in value)
    return value.status === 'available' ? (
      <FactValue value={value.data} />
    ) : (
      <EmptyState title={statusLabels[String(value.status)] ?? String(value.status)}>
        {String(value.reason ?? '')}
      </EmptyState>
    );
  const entries = Object.entries(value).filter(([, item]) => item !== null && item !== undefined);
  return (
    <dl className="facts">
      {entries.map(([key, item]) => (
        <div key={key}>
          <dt>{labels[key] ?? key}</dt>
          <dd>
            {typeof item === 'object' ? (
              <details>
                <summary>{Array.isArray(item) ? `${item.length} 项` : '查看详情'}</summary>
                <FactValue value={item} />
              </details>
            ) : (
              <FactValue value={item} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FactPanel({ path, title }: { path: string; title?: string }) {
  const query = useQuery({
    queryKey: ['inspection', path],
    queryFn: () => request<JsonValue>(path),
  });
  return (
    <section className="fact-panel">
      {title && <h3>{title}</h3>}
      {query.isLoading && <Loading />}
      <ErrorNotice error={query.error} />
      {query.data !== undefined && <FactValue value={query.data} />}
    </section>
  );
}

export function FactList({
  path,
  detailPath,
  idField,
  labelField = 'title',
  title,
  paginated = true,
}: {
  path: string;
  detailPath?: string;
  idField: string;
  labelField?: string;
  title?: string;
  paginated?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const query = useInfiniteQuery({
    queryKey: ['inspection', path],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: Record<string, JsonValue>[]; next_cursor?: string | null }>(
        `${path}${pageParam ? `${path.includes('?') ? '&' : '?'}after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => (paginated ? (page.next_cursor ?? undefined) : undefined),
  });
  return (
    <section className="fact-panel">
      {title && <h3>{title}</h3>}
      {query.isLoading && <Loading />}
      <ErrorNotice error={query.error} />
      {query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => {
          const id = String(
            idField
              .split('.')
              .reduce<JsonValue>((value, key) => (value as Record<string, JsonValue>)[key], item),
          );
          return (
            <article className="record-card" key={id}>
              <button
                className="record-heading"
                onClick={() => setSelected(selected === id ? null : id)}
              >
                {String(item[labelField] ?? id)}
              </button>
              {item.status != null && <span className="badge">{String(item.status)}</span>}
              {item.detail_status === 'expired' && (
                <p className="muted">正文详情已过期，摘要与依据仍可查看。</p>
              )}
              {selected === id ? (
                detailPath ? (
                  <FactPanel path={`${detailPath}/${encodeURIComponent(id)}`} />
                ) : (
                  <FactValue value={item} />
                )
              ) : (
                <JsonDetails value={item} label="摘要字段" />
              )}
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
    </section>
  );
}
