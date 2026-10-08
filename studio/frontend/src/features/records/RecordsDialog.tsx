import { useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { post, request, runPath, waitOperation } from '../../api/client';
import type {
  JsonValue,
  OperationAccepted,
  OperationView,
  ResourceRef,
  Schema,
  SessionBootstrap,
  SessionRef,
} from '../../api/types';
import { Button, Dialog, ErrorNotice, JsonDetails } from '../../components/Primitives';

export function RecordsDialog({
  session,
  runId,
  resources,
  close,
}: {
  session: SessionRef | null;
  runId: string | null;
  resources: ResourceRef[];
  close: () => void;
}) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [operation, setOperation] = useState<OperationView | null>(null);
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [publications, setPublications] = useState<
    { resource_id: string; publication_id: string }[]
  >([]);
  const [showPublications, setShowPublications] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const client = useQueryClient();
  const run = useQuery({
    queryKey: ['inspection', session?.store_binding_id, runId, 'export'],
    enabled: !!session && !!runId,
    queryFn: () =>
      request<NonNullable<SessionBootstrap['current_run']>>(
        `${runPath(session!.store_binding_id, runId!)}/snapshot`,
      ),
  });
  const query = useInfiniteQuery({
    queryKey: ['showcases'],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: Schema['ShowcaseView'][]; next_cursor: string | null }>(
        `/api/showcases${pageParam ? `?after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  const finish = async (accepted: OperationAccepted): Promise<void> => {
    await waitOperation(accepted, setOperation);
    client.invalidateQueries({ queryKey: ['showcases'] });
  };
  const exportRecord = async (): Promise<void> => {
    if (!session || !runId) return;
    setBusy(true);
    setError(null);
    try {
      await finish(
        await post<OperationAccepted>('/api/showcases/export', {
          title,
          runs: [{ store_binding_id: session.store_binding_id, run_id: runId }],
          include_children: true,
          publications,
          artifact_selection: artifacts.map((tool_call_id) => ({
            store_binding_id: session.store_binding_id,
            run_id: runId,
            tool_call_id,
          })),
        }),
      );
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const importRecord = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('bundle', file);
      await finish(
        await request<OperationAccepted>('/api/showcases/import', { method: 'POST', body }),
      );
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="真实记录与只读展示" onClose={close}>
      <p className="muted">
        导出所选运行及其子任务。记录保留捕获水位、未采集内容与过期详情的说明。
      </p>
      <label>
        记录标题
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="为这次工作命名"
        />
      </label>
      {runId && <p className="small break-word">所选运行：{runId}</p>}
      <div className="export-selection">
        {run.data?.tool_calls
          .filter((call) => call.result?.artifact)
          .map((call) => (
            <label className="checkbox-label" key={call.tool_call_id}>
              <input
                type="checkbox"
                checked={artifacts.includes(call.tool_call_id)}
                onChange={(event) =>
                  setArtifacts((old) =>
                    event.target.checked
                      ? [...old, call.tool_call_id]
                      : old.filter((id) => id !== call.tool_call_id),
                  )
                }
              />
              包含产物 · {call.tool_name} · {call.tool_call_id}
            </label>
          ))}
        {resources.length > 0 && (
          <>
            <Button onClick={() => setShowPublications(!showPublications)}>
              选择长期能力发布记录
            </Button>
            {showPublications &&
              resources.map((resource) => (
                <PublicationChoices
                  key={resource.resource_id}
                  resource={resource}
                  selected={publications
                    .filter((item) => item.resource_id === resource.resource_id)
                    .map((item) => item.publication_id)}
                  change={(id, checked) =>
                    setPublications((old) =>
                      checked
                        ? [...old, { resource_id: resource.resource_id, publication_id: id }]
                        : old.filter(
                            (item) =>
                              item.resource_id !== resource.resource_id ||
                              item.publication_id !== id,
                          ),
                    )
                  }
                />
              ))}
          </>
        )}
      </div>
      <div className="actions">
        <Button
          variant="primary"
          disabled={busy || !runId || !title.trim()}
          onClick={() => void exportRecord()}
        >
          导出所选运行
        </Button>
        <Button disabled={busy} onClick={() => input.current?.click()}>
          导入记录包
        </Button>
        <input
          hidden
          type="file"
          accept=".zip"
          ref={input}
          onChange={(event) => {
            void importRecord(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      <ErrorNotice error={error || query.error} />
      {operation && <JsonDetails value={operation} label="操作状态" />}
      {query.data?.pages
        .flatMap((page) => page.items)
        .map((record) => (
          <article className="record-card" key={record.showcase_id}>
            <h3>{record.title}</h3>
            <p className="muted small">
              {record.source === 'imported' ? '导入' : '导出'} ·{' '}
              {new Date(record.created_at).toLocaleString()} · 只读
            </p>
            <div className="actions">
              <a href={record.view_url} target="_blank" rel="noreferrer">
                打开只读记录
              </a>
              <a href={record.download_url} download>
                下载 ZIP
              </a>
              <a href={record.manifest_url} target="_blank" rel="noreferrer">
                记录来源
              </a>
            </div>
          </article>
        ))}
      {query.data?.pages[0].items.length === 0 && <p className="muted">暂无已保存记录。</p>}
      {query.hasNextPage && <Button onClick={() => void query.fetchNextPage()}>更多记录</Button>}
    </Dialog>
  );
}

function PublicationChoices({
  resource,
  selected,
  change,
}: {
  resource: ResourceRef;
  selected: string[];
  change: (id: string, checked: boolean) => void;
}) {
  const path = `/api/resources/${resource.resource_id}/${resource.kind}/publications`;
  const query = useInfiniteQuery({
    queryKey: ['inspection', path],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: Record<string, JsonValue>[]; next_cursor: string | null }>(
        `${path}${pageParam ? `?after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  return (
    <section>
      <h3>{resource.display_name}</h3>
      <ErrorNotice error={query.error} />
      {query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => {
          const id = String(item.publication_id);
          return (
            <label className="checkbox-label" key={id}>
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={(event) => change(id, event.target.checked)}
              />
              {String(item.description ?? item.kind ?? id)} ·{' '}
              {String(item.detail_status ?? item.status)}
            </label>
          );
        })}
      {query.hasNextPage && (
        <Button onClick={() => void query.fetchNextPage()}>更多发布记录</Button>
      )}
    </section>
  );
}
