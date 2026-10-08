import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ImagePlus, Square, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { post, request, sessionPath } from '../../api/client';
import type { GenerationView, MediaView, Schema, SessionRef, SessionView } from '../../api/types';
import type { useSession } from '../../streams/useSession';
import { Button, ErrorNotice, Loading } from '../../components/Primitives';
import { Message } from './Message';
import { Interaction } from './Interaction';
import { SpeechInput } from './SpeechInput';
import { composerKey, useComposer } from './useComposer';

export function ChatPane({
  session,
  generation,
  live,
  selectAgent,
  createSession,
  onSelected,
  openHistory,
}: {
  session: SessionRef | null;
  generation: GenerationView | null;
  live: ReturnType<typeof useSession>;
  selectAgent: () => void;
  createSession: () => Promise<SessionView>;
  onSelected: (session: SessionView) => void;
  openHistory: () => void;
}) {
  const composer = useComposer(
    session ? composerKey(session) : `new/${generation?.generation_id ?? ''}`,
  );
  const { text: draft, mode, attachments } = composer;
  const setDraft = (text: string): void =>
    composer.update(composer.key, (old) => ({ ...old, text }));
  const setMode = (mode: 'auto' | 'steer' | 'follow_up'): void =>
    composer.update(composer.key, (old) => ({ ...old, mode }));
  const config = useQuery({
    queryKey: ['configuration', generation?.generation_id],
    enabled: !!generation,
    queryFn: () =>
      request<Schema['EffectiveConfiguration']>(
        `/api/generations/${generation!.generation_id}/configuration`,
      ),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const { state, refresh } = live;
  const control = state.control;
  const allowed = control?.allowed_commands ?? [];
  const command = mode === 'auto' ? 'submit' : mode;
  const retiring = generation?.state !== 'ready';
  const canSend =
    generation && !retiring && (session ? allowed.includes(command) : mode === 'auto');
  const interaction = state.bootstrap?.current_run?.result?.pending_interaction;
  const blocks = Object.values(state.blocks);
  useEffect(() => {
    if (following.current && canvas.current) canvas.current.scrollTop = canvas.current.scrollHeight;
  }, [state.messages, state.blocks, interaction]);

  const commandAction = async (path: string, body: unknown = {}): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await post(path, body);
      await refresh();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const ensureSession = async (): Promise<SessionRef> => {
    if (session) return session;
    const created = await createSession();
    composer.move(composerKey(created.ref));
    onSelected(created);
    return created.ref;
  };
  const send = async (): Promise<void> => {
    if (!canSend || busy || (!draft.trim() && attachments.length === 0)) return;
    setBusy(true);
    setError(null);
    try {
      const ref = await ensureSession();
      const input = attachments.length
        ? [
            ...(draft.trim() ? [{ type: 'text', text: draft }] : []),
            ...attachments.map((image) => ({ type: 'image', media_id: image.media_id })),
          ]
        : draft;
      await post(`${sessionPath(ref)}/inputs`, { input, mode });
      composer.update(composerKey(ref), (old) => ({
        ...old,
        text: old.text === draft ? '' : old.text,
        attachments: old.attachments.filter(
          (item) => !attachments.some((sent) => sent.media_id === item.media_id),
        ),
      }));
      following.current = true;
      await refresh();
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const upload = async (files: FileList | null): Promise<void> => {
    if (!files?.length || !generation) return;
    setBusy(true);
    setError(null);
    try {
      const ref = await ensureSession();
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append('file', file);
        const media = await request<MediaView>(`${sessionPath(ref)}/media/images`, {
          method: 'POST',
          body,
        });
        composer.update(composerKey(ref), (old) => ({
          ...old,
          attachments: [...old.attachments, media],
        }));
      }
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const older = async (): Promise<void> => {
    if (!session) return;
    setBusy(true);
    const height = canvas.current?.scrollHeight ?? 0;
    try {
      const start = Math.max(0, (state.messages[0]?.ordinal ?? 0) - 100);
      const page = await request<{ items: typeof state.messages }>(
        `${sessionPath(session)}/messages?start=${start}&limit=100`,
      );
      following.current = false;
      live.dispatch({ type: 'history', sessionKey: sessionPath(session), messages: page.items });
      requestAnimationFrame(() => {
        if (canvas.current) canvas.current.scrollTop += canvas.current.scrollHeight - height;
      });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="chat-column">
      <header className="chat-header">
        <h1>{state.bootstrap?.session.title || '新会话'}</h1>
        <Button variant="ghost" aria-label="会话历史与恢复" onClick={openHistory}>
          ···
        </Button>
      </header>
      <div
        className="chat-canvas"
        ref={canvas}
        onScroll={() => {
          const element = canvas.current!;
          following.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
        }}
      >
        {session && !state.bootstrap ? (
          <Loading text="正在连接会话…" />
        ) : state.messages.length === 0 && blocks.length === 0 ? (
          <div className="welcome">
            <img src="/assets/empty.svg" alt="" />
            <h2>今天想做些什么？</h2>
            <p>
              {generation
                ? '输入一个任务，开始与 Agent 协作。'
                : '选择一个 Agent，开始你的第一个任务。'}
            </p>
            {!generation && <Button onClick={selectAgent}>选择 Agent</Button>}
          </div>
        ) : (
          <div className="messages">
            {(state.messages[0]?.ordinal ?? 0) > 0 && (
              <Button disabled={busy} onClick={() => void older()}>
                加载更早的消息
              </Button>
            )}
            {state.messages.map((message) => (
              <Message key={message.ordinal} message={message} />
            ))}
            {blocks.map((block) => (
              <article className="message live-message" key={block.key}>
                {block.channel === 'thinking' ? (
                  <details>
                    <summary>思考中</summary>
                    <ReactMarkdown>{block.text}</ReactMarkdown>
                  </details>
                ) : (
                  <>
                    <div className="message-label">
                      Iris <span className="live-dot" />
                    </div>
                    <div className="markdown">
                      <ReactMarkdown>{block.text}</ReactMarkdown>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
        {session && interaction && (
          <Interaction
            key={interaction.interaction_id}
            interaction={interaction}
            enabled={allowed.includes('resume')}
            busy={busy}
            respond={(id, response) =>
              commandAction(`${sessionPath(session)}/interactions/${id}/response`, { response })
            }
          />
        )}
        {state.bootstrap?.current_run?.result?.error && (
          <ErrorNotice error={state.bootstrap.current_run.result.error.message} />
        )}
      </div>
      <div className="composer-area">
        <ErrorNotice error={error || live.error} />
        {session && !control && state.bootstrap && (
          <div className="notice">
            此会话尚未接管。
            <button className="text-button" onClick={openHistory}>
              {state.bootstrap.lane.run_id ? '查看并恢复运行' : '继续此会话'}
            </button>
          </div>
        )}
        {control && control.pending.length > 0 && (
          <details className="pending-list">
            <summary>{control.pending.length} 条待处理输入 · 仅保存在当前进程</summary>
            {control.pending.map((item) => (
              <div key={item.submission_id}>
                <span className="badge">{item.stage}</span>{' '}
                {item.mode === 'follow_up' ? '下一轮' : '补充'} ·{' '}
                {typeof item.input === 'string' ? item.input : '包含图片的输入'}
                <small>{item.run_id}</small>
              </div>
            ))}
          </details>
        )}
        <div
          className="composer"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void upload(event.dataTransfer.files);
          }}
        >
          {attachments.length > 0 && (
            <div className="attachments">
              {attachments.map((media) => (
                <div key={media.media_id}>
                  <img src={media.original_url} alt={media.name ?? '图片附件'} />
                  <button
                    aria-label="移除图片"
                    onClick={() =>
                      composer.update(composer.key, (old) => ({
                        ...old,
                        attachments: old.attachments.filter(
                          (item) => item.media_id !== media.media_id,
                        ),
                      }))
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            aria-label="输入任务"
            placeholder="输入任务，或拖入图片…"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send();
              }
            }}
          />
          <div className="composer-controls">
            <input
              type="file"
              ref={fileInput}
              accept="image/*"
              multiple
              hidden
              onChange={(event) => {
                void upload(event.target.files);
                event.target.value = '';
              }}
            />
            <Button
              variant="ghost"
              aria-label="添加图片"
              disabled={!generation || busy || retiring}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus size={19} />
            </Button>
            {generation && config.data?.agent_config.speech?.enabled && (
              <SpeechInput
                key={composer.key}
                generationId={generation.generation_id}
                disabled={busy || !!retiring}
                onText={(text) =>
                  composer.update(composer.key, (old) => ({
                    ...old,
                    text: old.text ? `${old.text}\n${text}` : text,
                  }))
                }
              />
            )}
            <span className="composer-hint">
              {!generation
                ? '选择 Agent 后即可发送'
                : retiring
                  ? '此实例正在退役'
                  : control?.driver_state === 'settling'
                    ? '正在收尾…'
                    : generation.profile_id
                      ? '本地工作区'
                      : ''}
            </span>
            <select
              aria-label="输入模式"
              value={mode}
              onChange={(event) => setMode(event.target.value as typeof mode)}
            >
              <option value="auto">普通输入</option>
              <option value="steer">补充当前任务</option>
              <option value="follow_up">下一轮处理</option>
            </select>
            {session && allowed.includes('interrupt') && (
              <Button
                variant="ghost"
                title="中断当前运行"
                aria-label="中断当前运行"
                disabled={busy}
                onClick={() => void commandAction(`${sessionPath(session)}/interrupt`)}
              >
                <Square size={16} />
              </Button>
            )}
            <Button
              variant="primary"
              aria-label="发送"
              disabled={!canSend || busy || (!draft.trim() && attachments.length === 0)}
              onClick={() => void send()}
            >
              <ArrowUp size={18} />
            </Button>
          </div>
        </div>
        <p className="composer-help">Enter 发送 · Shift + Enter 换行</p>
      </div>
    </main>
  );
}
