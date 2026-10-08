import { useInfiniteQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react';
import { request, runPath, sessionPath } from '../../api/client';
import type { GenerationView, JsonValue, SessionRef } from '../../api/types';
import type { SessionState } from '../../streams/reducer';
import { Button, EmptyState, ErrorNotice, JsonDetails } from '../../components/Primitives';
import { FactList, FactPanel, FactValue } from './FactView';
import { ToolsPanel } from './ToolsPanel';
import { ResourcePanel } from '../learning/ResourcePanel';
import { GoalsPanel } from '../goals/GoalsPanel';
import { RunPanel } from './RunPanel';
import { ContextPanel } from './ContextPanel';
import { ModelPanel } from './ModelPanel';

export const observations = [
  ['runtime', '运行过程'],
  ['context', '上下文'],
  ['tools', '工具与委派'],
  ['memory', '长期记忆'],
  ['evolution', '项目经验'],
  ['goals', '目标与待办'],
  ['files', '文件与产物'],
  ['configuration', '配置'],
  ['model', '模型调用'],
] as const;
export type ObservationKind = (typeof observations)[number][0];

export function Inspector({
  kind,
  session,
  generation,
  state,
  observedRun,
  recentRun,
  selectCurrent,
  configure,
  records,
  openHistory,
}: {
  kind: ObservationKind;
  session: SessionRef | null;
  generation: GenerationView | null;
  state: SessionState;
  observedRun: string | null;
  recentRun: string | null;
  selectCurrent: () => void;
  configure: () => void;
  records: () => void;
  openHistory: () => void;
}) {
  const runId = observedRun ?? state.bootstrap?.current_run?.run.run_id ?? recentRun;
  const path = session && runId ? runPath(session.store_binding_id, runId) : null;
  const title = observations.find(([key]) => key === kind)![1];
  const hasHistory =
    !!session && (state.messages.length > 0 || (state.bootstrap?.messages.total_count ?? 0) > 0);
  return (
    <aside className="inspector">
      <header className="inspector-header">
        <span className="eyebrow">OBSERVATION</span>
        <h2>{title}</h2>
        <span className="muted small">{observedRun ? '所选历史运行' : '当前会话'}</span>
      </header>
      <div className="inspector-content">
        {observedRun && (
          <div className="notice">
            <small className="break-word">{observedRun}</small>
            <button className="text-button" onClick={selectCurrent}>
              返回当前运行
            </button>
          </div>
        )}
        {kind === 'memory' || kind === 'evolution' ? (
          <ResourcePanel key={kind} kind={kind} resources={generation?.resource_refs ?? []} />
        ) : kind === 'configuration' ? (
          generation ? (
            <>
              <Button onClick={configure}>编辑 Agent 配置</Button>
              <FactPanel
                path={`/api/generations/${generation.generation_id}/configuration`}
                title="实例实际采用"
              />
              {path && (
                <>
                  <FactList
                    path={`${path}/configuration-adoptions`}
                    idField="configuration_snapshot_id"
                    labelField="agent_id"
                    paginated={false}
                    title="运行配置采用"
                  />
                  <FactList
                    path={`${path}/source-adoptions`}
                    idField="adoption_id"
                    labelField="source_kind"
                    paginated={false}
                    title="来源采用"
                  />
                </>
              )}
            </>
          ) : (
            <EmptyState title="尚未选择 Agent">
              <Button onClick={configure}>导入配置</Button>
            </EmptyState>
          )
        ) : kind === 'goals' ? (
          session ? (
            <GoalsPanel
              key={sessionPath(session)}
              session={session}
              attached={!!state.control}
              generation={generation}
            />
          ) : (
            <EmptyState title="暂无目标与待办">创建会话后，可查看或设置长期目标。</EmptyState>
          )
        ) : path && session && runId ? (
          <>
            {kind === 'runtime' && (
              <>
                <RunPanel path={`${path}/snapshot`} control={!observedRun ? state.control : null} />
                {!observedRun && state.control && (
                  <JsonDetails value={state.control} label="当前会话控制与进程状态" />
                )}
                <RunEvents path={`${path}/events`} />
                <Button onClick={records}>导出此运行</Button>
              </>
            )}
            {kind === 'context' && <ContextPanel path={path} store={session.store_binding_id} />}
            {kind === 'tools' && <ToolsPanel store={session.store_binding_id} run={runId} />}
            {kind === 'files' && (
              <ToolsPanel store={session.store_binding_id} run={runId} filesOnly />
            )}
            {kind === 'model' && (
              <>
                <FactPanel
                  path={`/api/evidence/status?store_binding_id=${session.store_binding_id}&run_id=${runId}`}
                  title="记录状态"
                />
                <ModelPanel store={session.store_binding_id} run={runId} />
                <FactList
                  path={`${path}/model-streams`}
                  idField="model_stream_id"
                  labelField="model_stream_id"
                  title="实时流关联"
                  paginated={false}
                />
              </>
            )}
          </>
        ) : hasHistory ? (
          <EmptyState title="选择要观察的运行" icon={<Clock3 size={28} />}>
            <p>从已有运行中选择，查看当时的执行过程。</p>
            <Button onClick={openHistory}>查看运行历史</Button>
          </EmptyState>
        ) : (
          <EmptyState
            title={kind === 'runtime' ? '还没有运行记录' : `暂无${title}记录`}
            icon={<Clock3 size={28} />}
          >
            发送第一条消息后，
            <br />
            可以在这里查看任务的执行过程。
          </EmptyState>
        )}
      </div>
    </aside>
  );
}

function RunEvents({ path }: { path: string }) {
  const query = useInfiniteQuery({
    queryKey: ['inspection', path],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      request<{
        events: Record<string, JsonValue>[];
        next_cursor: { after_sequence: number } | null;
      }>(`${path}?after_sequence=${pageParam}&limit=100`),
    getNextPageParam: (page) => page.next_cursor?.after_sequence,
  });
  return (
    <section>
      <h3>执行过程</h3>
      <ErrorNotice error={query.error} />
      <ol className="timeline">
        {query.data?.pages
          .flatMap((page) => page.events)
          .map((event) => (
            <li key={String(event.sequence)}>
              <details>
                <summary>
                  {String(event.kind)} <small>#{String(event.sequence)}</small>
                </summary>
                <FactValue value={event} />
              </details>
            </li>
          ))}
      </ol>
      {query.hasNextPage && (
        <Button onClick={() => void query.fetchNextPage()}>继续读取事件</Button>
      )}
    </section>
  );
}
