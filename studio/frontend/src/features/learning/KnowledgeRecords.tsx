import type { Schema } from '../../api/types';
import { ErrorNotice, JsonDetails } from '../../components/Primitives';
import { RecordList, RemoteRecord } from '../inspection/RecordList';
import { count, describe, RecordedTime, Status, TextDocument } from '../inspection/Presentation';
import { PublicationView } from './PublicationView';

export function MemoryItemView({ value }: { value: Schema['MemoryItem'] }) {
  return (
    <>
      <p className="knowledge-text">{value.text}</p>
      <p className="muted">
        {value.category} · {value.kind} · {value.namespace}
      </p>
      {value.reason && <p>{value.reason}</p>}
      <JsonDetails value={value.evidence} label="支持证据" />
      <JsonDetails value={value} label="身份、来源与完整知识记录" />
    </>
  );
}
export function KnowledgeRecords({
  path,
  kind,
  tab,
}: {
  path: string;
  kind: 'memory' | 'evolution';
  tab: string;
}) {
  const url = `${path}/${tab}`;
  if (kind === 'evolution') {
    if (tab === 'publications')
      return (
        <RecordList<Schema['PublicationSummary']>
          path={url}
          identify={(item) => item.publication_id}
          summary={(item) => (
            <>
              <strong>{item.description}</strong>
              <span>
                {describe(item.stage)}
                <Status value={item.status} />
                <Status value={item.publication_state} />
                <Status value={item.detail_status} />
              </span>
              <RecordedTime value={item.created_at} />
            </>
          )}
          detail={(item) => (
            <RemoteRecord<Schema['PublicationHistoryEntry']> path={`${url}/${item.publication_id}`}>
              {(value) => <PublicationView value={value} />}
            </RemoteRecord>
          )}
        />
      );
    return (
      <RecordList<Schema['RevisionRequestSummary']>
        path={url}
        identify={(item) => item.id}
        summary={(item) => (
          <>
            <strong>{item.description}</strong>
            <span>
              修订请求
              <Status value={item.status} />
            </span>
            <RecordedTime value={item.created_at} />
          </>
        )}
        detail={(item) => (
          <RemoteRecord<Schema['RevisionItem']> path={`${url}/${item.id}`}>
            {(value) => (
              <>
                <p>{value.description}</p>
                <JsonDetails value={value.targets} label="开放的修订目标" open />
                <JsonDetails value={value} label="来源与完整修订请求" />
              </>
            )}
          </RemoteRecord>
        )}
      />
    );
  }
  if (tab === 'items')
    return (
      <RecordList<Schema['MemoryItem']>
        path={url}
        paginated={false}
        identify={(item) => item.id!}
        summary={(item) => (
          <>
            <strong>{item.text}</strong>
            <span>
              {item.category} · {item.kind}
              <Status value={item.status} />
            </span>
            <RecordedTime value={item.updated_at} />
          </>
        )}
        detail={(item) => (
          <RemoteRecord<Schema['MemoryItem']> path={`${url}/${item.id}`}>
            {(value) => <MemoryItemView value={value} />}
          </RemoteRecord>
        )}
      />
    );
  if (tab === 'overviews')
    return (
      <RecordList<Schema['MemoryOverviewDocument']>
        path={url}
        paginated={false}
        identify={(item) => item.namespace}
        summary={(item) => (
          <>
            <strong>{item.namespace} · 记忆概览</strong>
            <span>来源版本 {item.source_revision ?? '未记录'}</span>
          </>
        )}
        detail={(item) => (
          <>
            <TextDocument title="概览正文" text={item.text} />
            <TextDocument title="知识导航" text={item.navigation} />
            <ErrorNotice error={item.warning} />
            <JsonDetails value={item} label="概览来源" />
          </>
        )}
      />
    );
  if (tab === 'episodes')
    return (
      <RecordList<Schema['MemoryEpisode']>
        path={url}
        identify={(item) => item.id!}
        summary={(item) => (
          <>
            <strong>经历材料 · {item.records.length} 条原文</strong>
            <span>
              {item.source_type} · {item.namespace}
            </span>
            <RecordedTime value={item.created_at} />
          </>
        )}
        detail={(item) => (
          <>
            <JsonDetails value={item.records} label="实际经历原文" open />
            <JsonDetails value={item} label="材料身份与来源" />
          </>
        )}
      />
    );
  if (tab === 'observations')
    return (
      <RecordList<Schema['ObservationState']>
        path={url}
        paginated={false}
        identify={(item) => item.observation.id!}
        summary={(item) => (
          <>
            <strong>{item.observation.text}</strong>
            <Status value={item.status} />
            <RecordedTime value={item.observation.created_at} />
          </>
        )}
        detail={(item) => (
          <>
            <p>{item.observation.applicability}</p>
            <p>{item.reason || item.observation.reason}</p>
            <JsonDetails value={item.observation.evidence} label="提炼依据" />
            <JsonDetails value={item} label="处理结果与完整观察" />
          </>
        )}
      />
    );
  if (tab === 'generation-results')
    return (
      <RecordList<Schema['GenerationResult']>
        path={url}
        identify={(item) => item.id!}
        summary={(item) => (
          <>
            <strong>
              {describe(item.stage)}
              <Status value={item.status} />
            </strong>
            <RecordedTime value={item.created_at} />
          </>
        )}
        detail={(item) => (
          <>
            <ErrorNotice error={item.error} />
            <p>仍有后续材料：{item.has_more ? '是' : '否'}</p>
            <JsonDetails value={item.counts} label="本阶段实际计数" open />
            <JsonDetails value={item.usage} label="本阶段模型用量" open />
            <JsonDetails value={item} label="消费范围与完整生成结果" />
          </>
        )}
      />
    );
  if (tab === 'publications')
    return (
      <RecordList<Schema['MemoryPublicationRecord']>
        path={url}
        identify={(item) => item.publication_id!}
        summary={(item) => (
          <>
            <strong>
              {item.kind === 'overview' ? '概览发布' : '知识投影发布'}
              <Status value={item.status} />
            </strong>
            <span>知识版本 {count(item.item_revision)}</span>
            <RecordedTime value={item.created_at} />
          </>
        )}
        detail={(item) => (
          <>
            <ErrorNotice error={item.error} />
            {(item.documents ?? []).map((document) => (
              <TextDocument key={document.path} title={document.path} text={document.text} />
            ))}
            <JsonDetails value={item} label="发布身份与完整记录" />
          </>
        )}
      />
    );
  return (
    <RecordList<Schema['MemoryEvent']>
      path={url}
      paginated={false}
      identify={(item) => item.id!}
      summary={(item) => (
        <>
          <strong>
            {item.event_type} · {item.actor}
          </strong>
          <span>{item.reason}</span>
          <RecordedTime value={item.created_at} />
        </>
      )}
      detail={(item) => (
        <>
          <JsonDetails value={item.before} label="变化前" open />
          <JsonDetails value={item.after} label="变化后" open />
          <JsonDetails value={item} label="来源与完整变更事件" />
        </>
      )}
    />
  );
}
