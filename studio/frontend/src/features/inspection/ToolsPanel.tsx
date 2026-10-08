import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { request, runPath } from '../../api/client';
import type { Schema, SessionBootstrap } from '../../api/types';
import { Button, EmptyState, ErrorNotice, JsonDetails, Loading } from '../../components/Primitives';
import { FactPanel } from './FactView';

type RunView = NonNullable<SessionBootstrap['current_run']>;
export function ToolsPanel({
  store,
  run,
  filesOnly = false,
}: {
  store: string;
  run: string;
  filesOnly?: boolean;
}) {
  const path = runPath(store, run);
  const query = useQuery({
    queryKey: ['inspection', path, 'tools'],
    queryFn: () => request<RunView>(`${path}/snapshot`),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const calls = (query.data?.tool_calls ?? []).filter(
    (call) => !filesOnly || call.result?.artifact || call.result?.data?.file_change,
  );
  return (
    <>
      <ErrorNotice error={query.error} />
      {query.isLoading && <Loading />}
      {!query.isLoading && calls.length === 0 && (
        <EmptyState title={filesOnly ? '暂无文件产物' : '暂无工具调用'}>
          运行产生的真实调用和结果会显示在这里。
        </EmptyState>
      )}
      {calls.map((call) => (
        <article className="record-card" key={call.tool_call_id}>
          <button
            className="record-heading"
            onClick={() => setSelected(selected === call.tool_call_id ? null : call.tool_call_id)}
          >
            {call.tool_name}
            <span className="badge">{call.phase}</span>
          </button>
          {selected === call.tool_call_id && (
            <>
              <JsonDetails value={call.arguments} label="真实参数" open />
              <JsonDetails value={call.result} label="执行结果" open />
              {call.result?.data?.file_change && (
                <FactPanel
                  path={`${path}/tools/${call.tool_call_id}/file-change`}
                  title="本次文件变化"
                />
              )}
            </>
          )}
          {call.result?.artifact && (
            <div className="artifact">
              <p>
                {call.result.artifact.mime_type} · {call.result.artifact.size_bytes} bytes
              </p>
              <pre>{call.result.artifact.preview}</pre>
              <div className="actions">
                <a href={call.result.artifact.download_url} download>
                  下载产物
                </a>
                {call.result.artifact.preview_url && (
                  <a href={call.result.artifact.preview_url} target="_blank" rel="noreferrer">
                    预览
                  </a>
                )}
                {call.result.artifact.text_url && (
                  <a href={call.result.artifact.text_url} target="_blank" rel="noreferrer">
                    完整文本
                  </a>
                )}
              </div>
            </div>
          )}
        </article>
      ))}
      {!filesOnly && <Children store={store} run={run} />}
    </>
  );
}

function Children({ store, run }: { store: string; run: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const path = `${runPath(store, run)}/children`;
  const query = useInfiniteQuery({
    queryKey: ['inspection', path],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: Schema['ChildRunSummary'][]; next_cursor: string | null }>(
        `${path}${pageParam ? `?after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  return (
    <section>
      <h3>委派的子任务</h3>
      <ErrorNotice error={query.error} />
      {query.data?.pages
        .flatMap((page) => page.items)
        .map((child) => (
          <article className="record-card" key={child.run.run_id}>
            <button
              className="record-heading"
              onClick={() => setSelected(selected === child.run.run_id ? null : child.run.run_id)}
            >
              {child.agent_selector} · {child.run.phase}
            </button>
            <small className="break-word">父调用 {child.parent_tool_call_id}</small>
            {selected === child.run.run_id && (
              <>
                <FactPanel path={`${runPath(store, child.run.run_id)}/snapshot`} />
                <ToolsPanel store={store} run={child.run.run_id} />
              </>
            )}
          </article>
        ))}
      {query.data?.pages[0].items.length === 0 && <p className="muted">没有委派记录。</p>}
      {query.hasNextPage && <Button onClick={() => void query.fetchNextPage()}>更多子任务</Button>}
    </section>
  );
}
