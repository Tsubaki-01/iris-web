import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Layers,
  BookOpen,
  TrendingUp,
  List,
  Folder,
  SlidersHorizontal,
  Cpu,
  PanelRight,
  Archive,
  History,
} from 'lucide-react';
import { post, request } from '../api/client';
import type { GenerationView, ProfileView, Schema, SessionRef, SessionView } from '../api/types';
import { Button, ErrorNotice, Loading } from '../components/Primitives';
import { useSession } from '../streams/useSession';
import { ChatPane } from '../features/chat/ChatPane';
import { StoreSessions } from '../features/sessions/StoreSessions';
import { SessionPicker } from '../features/sessions/SessionPicker';
import { Inspector, observations, type ObservationKind } from '../features/inspection/Inspector';
import { AgentPicker } from './AgentPicker';

const ConfigDialog = lazy(() =>
  import('../features/config/ConfigDialog').then((module) => ({ default: module.ConfigDialog })),
);
const SessionHistory = lazy(() =>
  import('../features/sessions/SessionHistory').then((module) => ({
    default: module.SessionHistory,
  })),
);
const RecordsDialog = lazy(() =>
  import('../features/records/RecordsDialog').then((module) => ({ default: module.RecordsDialog })),
);

const icons = {
  runtime: Activity,
  context: Layers,
  memory: BookOpen,
  evolution: TrendingUp,
  goals: List,
  files: Folder,
  configuration: SlidersHorizontal,
  model: Cpu,
};

export function Workbench() {
  const client = useQueryClient();
  const app = useQuery({
    queryKey: ['app'],
    queryFn: () => request<Schema['Bootstrap']>('/api/bootstrap'),
  });
  const [generation, setGeneration] = useState<GenerationView | null>(null);
  const [session, setSession] = useState<SessionRef | null>(null);
  const [sessionPicker, setSessionPicker] = useState(false);
  const [initialPath] = useState(() => {
    const params = new URL(location.href).searchParams;
    return params.has('store') && params.has('session')
      ? `/api/stores/${encodeURIComponent(params.get('store')!)}/sessions/${encodeURIComponent(params.get('session')!)}`
      : null;
  });
  const navigationRestored = useRef(false);
  const savedSession = useQuery({
    queryKey: ['navigation', initialPath],
    enabled: !!initialPath,
    queryFn: () => request<SessionView>(initialPath!),
  });
  const [kind, setKind] = useState<ObservationKind>('runtime');
  const [observedRun, setObservedRun] = useState<string | null>(null);
  const [recentRun, setRecentRun] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [config, setConfig] = useState<ProfileView | null>(null);
  const [history, setHistory] = useState(false);
  const [records, setRecords] = useState(false);
  const [mobileInspector, setMobileInspector] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const live = useSession(session);
  const profiles = app.data?.profiles ?? [];
  const generations = app.data?.generations ?? [];
  const profile = profiles.find((item) => item.profile_id === generation?.profile_id);
  const workspace =
    app.data?.workspaces.find((item) => item.workspace_id === profile?.workspace_id) ??
    app.data?.workspaces[0];
  const sessions = useQuery({
    queryKey: ['sessions', workspace?.workspace_id],
    enabled: !!workspace,
    queryFn: () =>
      request<Schema['WorkspaceSessions']>(`/api/workspaces/${workspace!.workspace_id}/sessions`),
  });
  useEffect(() => {
    const active =
      live.state.bootstrap?.current_run?.run.run_id ?? live.state.control?.current_run_id;
    if (active) setRecentRun(active);
  }, [live.state.bootstrap, live.state.control]);
  useEffect(() => {
    const actual = generations.find((item) => item.generation_id === generation?.generation_id);
    if (actual && actual !== generation) setGeneration(actual);
    else if (app.data && generation && !actual) setGeneration(null);
  }, [generations, generation, app.data]);
  useEffect(() => {
    if (!navigationRestored.current && savedSession.data && app.data) {
      navigationRestored.current = true;
      setSession(savedSession.data.ref);
      setGeneration(
        app.data.generations.find(
          (item) => item.generation_id === savedSession.data.generation_id,
        ) ?? null,
      );
    }
  }, [savedSession.data, app.data]);
  const rememberSession = (value: SessionRef | null): void => {
    const url = new URL(location.href);
    if (value) {
      url.searchParams.set('store', value.store_binding_id);
      url.searchParams.set('session', value.session_id);
    } else {
      url.searchParams.delete('store');
      url.searchParams.delete('session');
    }
    window.history.replaceState(null, '', url);
  };
  const registerGeneration = (value: GenerationView): void => {
    client.setQueryData<Schema['Bootstrap']>(['app'], (old) =>
      old
        ? {
            ...old,
            generations: [
              ...old.generations.filter((item) => item.generation_id !== value.generation_id),
              value,
            ],
          }
        : old,
    );
    setGeneration(value);
  };
  const createSession = async (): Promise<SessionView> => {
    if (!generation) throw new Error('请先选择一个已采用的 Agent 实例');
    return post<SessionView>(`/api/stores/${generation.store_binding_id}/sessions`, {
      generation_id: generation.generation_id,
    });
  };
  const selectedSession = (view: SessionView, actual?: GenerationView): void => {
    if (
      view.ref.store_binding_id !== session?.store_binding_id ||
      view.ref.session_id !== session?.session_id
    ) {
      setObservedRun(null);
      setRecentRun(null);
    }
    setSession(view.ref);
    rememberSession(view.ref);
    if (actual) registerGeneration(actual);
    else if (view.generation_id) {
      const owner = generations.find((item) => item.generation_id === view.generation_id);
      if (owner) setGeneration(owner);
    }
    client.invalidateQueries({ queryKey: ['sessions'] });
  };
  const newSession = async (): Promise<void> => {
    if (!generation) {
      setPicker(true);
      return;
    }
    try {
      selectedSession(await createSession());
      setError(null);
    } catch (caught) {
      setError(caught);
    }
  };
  const openSession = async (ref: SessionRef): Promise<void> => {
    try {
      const view = await request<SessionView>(
        `/api/stores/${ref.store_binding_id}/sessions/${ref.session_id}`,
      );
      selectedSession(view);
      setError(null);
    } catch (caught) {
      setError(caught);
    }
  };
  const configure = (): void => {
    if (profile) setConfig(profile);
    else setPicker(true);
  };
  const chooseGeneration = (value: GenerationView): void => {
    registerGeneration(value);
    if (session && !live.state.control) {
      setPicker(false);
      return;
    }
    setSession(null);
    rememberSession(null);
    setObservedRun(null);
    setRecentRun(null);
    setPicker(false);
  };
  return (
    <div className={`studio ${mobileInspector ? 'show-inspector' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <img src="/assets/logo.svg" alt="" />
          <span>Iris</span>
          <small>STUDIO</small>
        </div>
        <span className="workspace-label">
          本地工作区<span className="slash">/</span>
          {workspace?.title ?? '默认工作区'}
        </span>
        <Button onClick={configure}>Agent 配置</Button>
        <Button
          variant="ghost"
          className="mobile-toggle"
          aria-label="切换观察栏"
          onClick={() => setMobileInspector(!mobileInspector)}
        >
          <PanelRight size={19} />
        </Button>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <button className="agent-select" onClick={() => setPicker(true)}>
            <img src="/assets/agent.svg" alt="" />
            <span>{profile?.title ?? '选择 Agent'}</span>
            <span className="muted">⌄</span>
          </button>
          <Button variant="primary" className="new-session" onClick={() => void newSession()}>
            ＋ 新建会话
          </Button>
          <span className="sidebar-label">观察</span>
          <nav aria-label="观察面板" className="observation-nav">
            {observations.map(([key, title]) => {
              const Icon = key === 'tools' ? null : icons[key];
              return (
                <button
                  key={key}
                  className={kind === key ? 'selected' : ''}
                  aria-pressed={kind === key}
                  onClick={() => {
                    setKind(key);
                  }}
                  title={title}
                >
                  {Icon ? <Icon size={20} /> : <img src="/assets/tools.svg" alt="" />}
                  <span>{title}</span>
                </button>
              );
            })}
          </nav>
          <div className="recent-sessions">
            <div className="sidebar-label">最近会话</div>
            <ErrorNotice error={sessions.error} />
            {!sessions.data?.drafts.length &&
              !sessions.data?.stores.some((store) => store.page.items.length) && (
                <p className="muted small">暂无会话</p>
              )}
            {sessions.data?.drafts.map((view) => (
              <button
                className={
                  view.ref.session_id === session?.session_id &&
                  view.ref.store_binding_id === session.store_binding_id
                    ? 'current'
                    : ''
                }
                key={`${view.ref.store_binding_id}/${view.ref.session_id}`}
                onClick={() => void openSession(view.ref)}
              >
                {view.title || '新会话'}
              </button>
            ))}
            {sessions.data?.stores.map((store) => (
              <StoreSessions
                key={store.store_binding_id}
                store={store}
                selected={session}
                open={openSession}
              />
            ))}
          </div>
          <Button variant="ghost" aria-label="会话列表" onClick={() => setSessionPicker(true)}>
            <History size={16} />
            会话列表
          </Button>
          <Button onClick={() => setPicker(true)}>工作区设置</Button>
          <Button variant="ghost" onClick={() => setRecords(true)}>
            <Archive size={14} />
            记录与导出
          </Button>
        </aside>
        <ChatPane
          session={session}
          generation={generation}
          live={live}
          selectAgent={() => setPicker(true)}
          createSession={createSession}
          onSelected={selectedSession}
          openHistory={() => (session ? setHistory(true) : setSessionPicker(true))}
        />
        <Inspector
          kind={kind}
          session={session}
          generation={generation}
          state={live.state}
          observedRun={observedRun}
          recentRun={recentRun}
          selectCurrent={() => setObservedRun(null)}
          configure={configure}
          records={() => setRecords(true)}
          openHistory={() => setHistory(true)}
        />
      </div>
      <footer className="app-footer">
        <span className={`status-dot ${live.connection}`} />
        {session
          ? live.connection === 'connected'
            ? `已连接 · ${live.state.control?.driver_state ?? '历史只读'}`
            : live.connection === 'connecting'
              ? '正在连接…'
              : '连接中断，正在重连'
          : generation
            ? '准备就绪'
            : '等待选择 Agent'}
        <span className="footer-error">
          {app.error instanceof Error
            ? `无法连接本地服务：${app.error.message}`
            : error instanceof Error
              ? error.message
              : ''}
        </span>
      </footer>
      {sessionPicker && (
        <SessionPicker
          data={sessions.data}
          selected={session}
          open={openSession}
          close={() => setSessionPicker(false)}
        />
      )}
      {picker && (
        <AgentPicker
          profiles={profiles}
          workspaces={app.data?.workspaces ?? []}
          generations={generations}
          choose={chooseGeneration}
          configure={(value) => {
            setConfig(value);
            setPicker(false);
          }}
          close={() => setPicker(false)}
        />
      )}
      <Suspense fallback={<Loading text="正在打开面板…" />}>
        {config && (
          <ConfigDialog
            profile={config}
            generations={generations}
            close={() => setConfig(null)}
            adopted={(value) => {
              chooseGeneration(value);
              setConfig(null);
            }}
          />
        )}
        {history && session && (
          <SessionHistory
            session={session}
            bootstrap={live.state.bootstrap}
            generations={generations}
            selectedGeneration={generation}
            close={() => setHistory(false)}
            onSession={selectedSession}
            observeRun={setObservedRun}
            changed={live.refresh}
          />
        )}
        {records && (
          <RecordsDialog
            resources={generation?.resource_refs ?? []}
            session={session}
            runId={observedRun ?? recentRun}
            close={() => setRecords(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
