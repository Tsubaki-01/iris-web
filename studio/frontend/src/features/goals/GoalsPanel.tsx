import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiFailure, post, request, sessionPath } from '../../api/client';
import type { GenerationView, JsonValue, Schema, SessionRef } from '../../api/types';
import { Button, ErrorNotice, JsonDetails } from '../../components/Primitives';
import { FactPanel, FactValue } from '../inspection/FactView';

export function GoalsPanel({
  session,
  attached,
  generation,
}: {
  session: SessionRef;
  attached: boolean;
  generation: GenerationView | null;
}) {
  const path = sessionPath(session);
  const client = useQueryClient();
  const [objective, setObjective] = useState('');
  const [maxRounds, setMaxRounds] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<unknown>(null);
  const goal = useQuery({
    queryKey: ['inspection', `${path}/goal`],
    queryFn: () => request<Schema['Observation_GoalView_']>(`${path}/goal`),
  });
  const current = goal.data?.data?.goal;
  const act = async (action: string): Promise<void> => {
    setBusy(true);
    setError(null);
    const body =
      action === 'create' || action === 'edit'
        ? { objective, ...(maxRounds ? { max_rounds: Number(maxRounds) } : {}) }
        : action === 'pause' || action === 'complete'
          ? { reason }
          : {};
    try {
      setResult(await post(`${path}/goal/${action}`, body));
      client.invalidateQueries({ queryKey: ['inspection'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <h3>长期目标</h3>
      <ErrorNotice error={goal.error || error} />
      {goal.data && <FactValue value={goal.data as unknown as JsonValue} />}
      {goal.data?.status !== 'disabled' && (
        <details open={!current}>
          <summary>{current ? '管理目标' : '创建目标'}</summary>
          <label>
            目标
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder={current?.objective ?? '明确希望完成的事情'}
            />
          </label>
          <label>
            最大轮数
            <input
              type="number"
              min={1}
              value={maxRounds}
              onChange={(event) => setMaxRounds(event.target.value)}
              placeholder="采用 Agent 默认值"
            />
          </label>
          <div className="actions">
            <Button
              disabled={
                busy ||
                !attached ||
                (!current && generation?.state !== 'ready') ||
                !objective.trim()
              }
              onClick={() => void act(current ? 'edit' : 'create')}
            >
              {current ? '更新目标' : '创建并开始'}
            </Button>
            {current && (
              <Button
                disabled={busy || !attached || generation?.state !== 'ready'}
                onClick={() => void act('resume')}
              >
                恢复自动推进
              </Button>
            )}
          </div>
          {current && (
            <>
              <label>
                暂停 / 完成原因
                <input value={reason} onChange={(event) => setReason(event.target.value)} />
              </label>
              <div className="actions wrap">
                <Button
                  disabled={busy || !attached || !reason.trim()}
                  onClick={() => void act('pause')}
                >
                  暂停推进
                </Button>
                <Button
                  disabled={busy || !attached || !reason.trim()}
                  onClick={() => void act('complete')}
                >
                  标记完成
                </Button>
                <Button disabled={busy || !attached} onClick={() => void act('clear')}>
                  清除目标
                </Button>
              </div>
            </>
          )}
          <p className="muted small">
            暂停目标只阻止后续推进。中断当前运行请使用聊天输入区的停止按钮。
          </p>
        </details>
      )}
      {result && <JsonDetails value={result} label="目标操作结果" />}
      <TodoEditor session={session} />
      <FactPanel path={`${path}/todo`} title="当前待办清单" />
    </>
  );
}

function TodoEditor({ session }: { session: SessionRef }) {
  const path = sessionPath(session);
  const query = useQuery({
    queryKey: ['inspection', `${path}/todo/document`],
    queryFn: () => request<Schema['Observation_TodoDocument_']>(`${path}/todo/document`),
  });
  const [text, setText] = useState('');
  const [baseText, setBaseText] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const client = useQueryClient();
  useEffect(() => {
    if (query.data?.data && !dirty) {
      setText(query.data.data.text ?? '');
      setBaseText(query.data.data.text);
    }
  }, [query.data, dirty]);
  const save = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await request(`${path}/todo`, {
        method: 'PUT',
        body: JSON.stringify({ base_text: baseText, text }),
      });
      setBaseText(text);
      setDirty(false);
      client.invalidateQueries({ queryKey: ['inspection'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  if (query.data?.status !== 'available') return null;
  return (
    <details>
      <summary>编辑 Todo 文件</summary>
      <p className="muted small break-word">{query.data.data?.path}</p>
      <textarea
        className="code-input"
        rows={8}
        aria-label="Todo Markdown"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setDirty(true);
        }}
      />
      <ErrorNotice error={error} />
      {error instanceof ApiFailure && (
        <JsonDetails value={error.details} label="当前文件内容" open />
      )}
      <Button disabled={busy || !dirty} onClick={() => void save()}>
        保存清单
      </Button>
    </details>
  );
}
