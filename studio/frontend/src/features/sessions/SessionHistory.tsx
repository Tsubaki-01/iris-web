import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { post, request, runPath, sessionPath } from '../../api/client';
import type {
  GenerationView,
  Run,
  SessionBootstrap,
  SessionRef,
  SessionView,
} from '../../api/types';
import { Button, Dialog, ErrorNotice, Loading } from '../../components/Primitives';

export function SessionHistory({
  session,
  bootstrap,
  generations,
  selectedGeneration,
  close,
  onSession,
  observeRun,
  changed,
}: {
  session: SessionRef;
  bootstrap: SessionBootstrap | null;
  generations: GenerationView[];
  selectedGeneration: GenerationView | null;
  close: () => void;
  onSession: (session: SessionView, generation?: GenerationView) => void;
  observeRun: (runId: string) => void;
  changed: () => Promise<void>;
}) {
  const [generationId, setGenerationId] = useState(selectedGeneration?.generation_id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const client = useQueryClient();
  const generation = generations.find((item) => item.generation_id === generationId);
  const runs = useInfiniteQuery({
    queryKey: ['inspection', session.store_binding_id, session.session_id, 'runs'],
    initialPageParam: '',
    queryFn: ({ pageParam }) =>
      request<{ items: Run[]; next_cursor: string | null }>(
        `${sessionPath(session)}/runs?limit=50${pageParam ? `&after=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
  });
  const [title, setTitle] = useState(bootstrap?.session.title ?? '');
  const currentRun = bootstrap?.lane.run;
  const attach = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      if (currentRun) {
        const result = await post<{ generation_id: string }>(`${sessionPath(session)}/restore`, {
          run_id: currentRun.run_id,
          generation_id: generationId,
          expected_activation_id: currentRun.current_activation_id,
        });
        const actual = await request<GenerationView>(`/api/generations/${result.generation_id}`);
        const view = await request<SessionView>(sessionPath(session));
        onSession(view, actual);
      } else {
        const result = await post<{ session: SessionView; generation: GenerationView }>(
          `${sessionPath(session)}/attach`,
          { generation_id: generationId },
        );
        onSession(result.session, result.generation);
      }
      await changed();
      client.invalidateQueries({ queryKey: ['app'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const fork = async (runId: string): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const view = await post<SessionView>(`${runPath(session.store_binding_id, runId)}/fork`, {
        generation_id: generationId,
      });
      onSession(view, generation);
      close();
      client.invalidateQueries({ queryKey: ['sessions'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const rename = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await request(sessionPath(session), { method: 'PATCH', body: JSON.stringify({ title }) });
      await changed();
      client.invalidateQueries({ queryKey: ['sessions'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="会话历史与恢复" onClose={close}>
      <ErrorNotice error={error || runs.error} />
      <div className="inline-form">
        <input
          aria-label="会话标题"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Button disabled={busy || !title.trim()} onClick={() => void rename()}>
          重命名
        </Button>
      </div>
      <label>
        继续时使用的实例
        <select value={generationId} onChange={(event) => setGenerationId(event.target.value)}>
          <option value="">选择实例</option>
          {generations
            .filter((item) => item.state !== 'retired')
            .map((item) => (
              <option key={item.generation_id} value={item.generation_id}>
                {item.profile_id} · {item.generation_id} · {item.state}
              </option>
            ))}
        </select>
      </label>
      <div className="notice">
        <p>
          历史所在存储：<code>{session.store_binding_id}</code>
        </p>
        {generation && (
          <p>
            所选实例存储：<code>{generation.store_binding_id}</code>
          </p>
        )}
        {generation && generation.store_binding_id !== session.store_binding_id && (
          <p>恢复或继续会创建一个绑定到历史存储的独立实例。原实例不变。</p>
        )}
      </div>
      {!bootstrap?.control || bootstrap.control.allowed_commands.includes('restore') ? (
        <Button
          variant="primary"
          disabled={busy || !generation || (!currentRun && generation.state !== 'ready')}
          onClick={() => void attach()}
        >
          {currentRun ? '显式恢复当前运行' : '继续此会话'}
        </Button>
      ) : (
        <p className="muted">已绑定实例 · {bootstrap.session.generation_id}</p>
      )}
      <h3>运行历史</h3>
      {runs.isLoading && <Loading />}
      {runs.data?.pages
        .flatMap((page) => page.items)
        .map((run) => (
          <article className="record-card" key={run.run_id}>
            <div className="row-between">
              <strong>{run.phase}</strong>
              <time>{new Date(run.created_at).toLocaleString()}</time>
            </div>
            <small className="break-word">{run.run_id}</small>
            <p className="muted">{run.stop_reason ?? '运行尚未结束'}</p>
            <div className="actions">
              <Button
                onClick={() => {
                  observeRun(run.run_id);
                  close();
                }}
              >
                观察此运行
              </Button>
              {run.finished_at && (
                <Button
                  disabled={
                    busy ||
                    generation?.state !== 'ready' ||
                    generation.store_binding_id !== session.store_binding_id
                  }
                  onClick={() => void fork(run.run_id)}
                >
                  从此处分支
                </Button>
              )}
            </div>
          </article>
        ))}
      {runs.data?.pages[0].items.length === 0 && <p className="muted">此会话尚无运行记录。</p>}
      {runs.hasNextPage && (
        <Button disabled={runs.isFetchingNextPage} onClick={() => void runs.fetchNextPage()}>
          更多运行
        </Button>
      )}
    </Dialog>
  );
}
