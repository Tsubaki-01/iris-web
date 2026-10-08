import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { post, waitOperation } from '../../api/client';
import type { OperationAccepted, OperationView, ResourceRef } from '../../api/types';
import { Button, ErrorNotice, JsonDetails } from '../../components/Primitives';
import { FactPanel } from '../inspection/FactView';
import { KnowledgeRecords } from './KnowledgeRecords';
import { readSse } from '../../streams/sse';

const memoryTabs = [
  ['items', '知识条目', 'id'],
  ['overviews', '概览', 'namespace'],
  ['episodes', '经历材料', 'id'],
  ['observations', '观察材料', 'observation.id'],
  ['generation-results', '生成结果', 'id'],
  ['publications', '发布记录', 'publication_id'],
  ['events', '变更事件', 'id'],
];
const evolutionTabs = [
  ['publications', '发布记录', 'publication_id'],
  ['requests', '修订请求', 'id'],
  ['skill', '当前经验', ''],
  ['sources', '待处理来源', ''],
];

export function ResourcePanel({
  resources,
  kind,
}: {
  resources: ResourceRef[];
  kind: 'memory' | 'evolution';
}) {
  const options = resources.filter((item) => item.kind === kind);
  const [selected, setSelected] = useState('');
  const resource = options.find((item) => item.resource_id === selected) ?? options[0];
  const [tab, setTab] = useState('');
  const tabs = kind === 'memory' ? memoryTabs : evolutionTabs;
  const currentTab = tabs.find((item) => item[0] === tab) ?? tabs[0];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [operation, setOperation] = useState<OperationView | null>(null);
  const [description, setDescription] = useState('');
  const [targetKind, setTargetKind] = useState('prompt');
  const [targetName, setTargetName] = useState('');
  const client = useQueryClient();
  const base = resource ? `/api/resources/${resource.resource_id}` : null;
  useEffect(() => {
    if (!base) return;
    const controller = new AbortController();
    let reconnect: ReturnType<typeof setTimeout>;
    const subscribe = async (): Promise<void> => {
      try {
        const response = await fetch(`${base}/stream`, { signal: controller.signal });
        if (!response.ok || !response.body) throw new Error('资源订阅连接失败');
        for await (const frame of readSse(response.body)) {
          if (frame.event === 'stream.ready') setError(null);
          if (
            frame.event === 'maintenance.changed' ||
            frame.event === 'source.adopted' ||
            frame.event === 'stream.ready'
          )
            client.invalidateQueries({ queryKey: ['inspection'] });
        }
        if (!controller.signal.aborted) throw new Error('资源连接中断，正在重连…');
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught);
          reconnect = setTimeout(() => void subscribe(), 1500);
        }
      }
    };
    void subscribe();
    return () => {
      controller.abort();
      clearTimeout(reconnect);
    };
  }, [base, client]);
  const maintain = async (action: string): Promise<void> => {
    if (!base) return;
    setBusy(true);
    setError(null);
    try {
      await waitOperation(
        await post<OperationAccepted>(
          `${base}/maintenance/${action}`,
          action === 'revision'
            ? { description, targets: [{ kind: targetKind, name: targetName }] }
            : {},
        ),
        setOperation,
      );
      client.invalidateQueries({ queryKey: ['inspection'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  if (!resource || !base)
    return (
      <p className="muted">
        当前实例未绑定{kind === 'memory' ? '长期记忆' : '项目经验'}资源。可在 Agent
        配置中启用并采用新实例。
      </p>
    );
  const resourcePath = `${base}/${kind}`;
  return (
    <>
      <label>
        共享资源
        <select value={resource.resource_id} onChange={(event) => setSelected(event.target.value)}>
          {options.map((item) => (
            <option key={item.resource_id} value={item.resource_id}>
              {item.display_name}
            </option>
          ))}
        </select>
      </label>
      <p className="muted small break-word">{resource.resource_ref}</p>
      <FactPanel path={`${base}/maintenance`} title="维护状态" />
      <Button
        disabled={busy}
        onClick={() => void maintain(kind === 'memory' ? 'memory-cycle' : 'experience')}
      >
        {busy ? '维护请求处理中…' : kind === 'memory' ? '请求一轮记忆整理' : '请求项目经验整理'}
      </Button>
      <p className="muted small">手动请求仍等待前台、资源锁和已运行工作收尾。</p>
      <ErrorNotice error={error} />
      {operation && <JsonDetails value={operation} label="本次维护操作" open />}
      {kind === 'memory' && (
        <FactPanel path={`${resourcePath}/generation`} title="材料与生成进度" />
      )}
      <div className="tabs" role="tablist" aria-label="资源内容">
        {tabs.map(([key, title]) => (
          <button
            key={key}
            role="tab"
            aria-selected={currentTab[0] === key}
            onClick={() => setTab(key)}
          >
            {title}
          </button>
        ))}
      </div>
      {currentTab[2] ? (
        <KnowledgeRecords
          key={`${resourcePath}/${currentTab[0]}`}
          path={resourcePath}
          kind={kind}
          tab={currentTab[0]}
        />
      ) : (
        <FactPanel path={`${resourcePath}/${currentTab[0]}`} />
      )}
      {kind === 'evolution' && (
        <details>
          <summary>发起有限修订</summary>
          <label>
            修订说明
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label>
            目标类型
            <select value={targetKind} onChange={(event) => setTargetKind(event.target.value)}>
              <option value="prompt">Prompt</option>
              <option value="config">Config</option>
            </select>
          </label>
          <label>
            已开放目标名称
            <input value={targetName} onChange={(event) => setTargetName(event.target.value)} />
          </label>
          <Button
            disabled={busy || !description.trim() || !targetName.trim()}
            onClick={() => void maintain('revision')}
          >
            提交修订请求
          </Button>
        </details>
      )}
    </>
  );
}
