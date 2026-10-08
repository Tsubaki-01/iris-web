import type { Schema } from '../../api/types';
import { JsonDetails } from '../../components/Primitives';
import { describe, RecordedTime, Status, TextDocument } from '../inspection/Presentation';

function Documents({
  title,
  documents,
}: {
  title: string;
  documents: Schema['PublicationDocument'][];
}) {
  return (
    <section className="publication-documents">
      <h4>{title}</h4>
      {documents.length ? (
        documents.map((document) => (
          <TextDocument key={document.path} title={document.path} text={document.text} />
        ))
      ) : (
        <p className="muted">没有对应的已记录文档。</p>
      )}
    </section>
  );
}

export function PublicationView({ value }: { value: Schema['PublicationHistoryEntry'] }) {
  const { summary, detail } = value;
  return (
    <section>
      <div className="actions wrap">
        <Status value={summary.status} />
        <Status value={summary.publication_state} />
        <Status value={summary.detail_status} />
      </div>
      <p>{summary.reason}</p>
      {summary.detail_status === 'expired' && (
        <div className="notice">
          完整正文已超过保留范围。摘要与证据仍保留，不从当前文件补造历史内容。
        </div>
      )}
      {detail && (
        <>
          <p>{detail.effect}</p>
          <Documents title="发布前正文" documents={detail.before_documents ?? []} />
          <Documents title="候选正文" documents={detail.candidate_documents ?? []} />
          <section>
            <h4>实际发布后正文</h4>
            {detail.publication_state === 'confirmed' ? (
              <>
                <p className="muted small">发布 owner 已确认写入以下候选正文。</p>
                <Documents title="已确认写入" documents={detail.candidate_documents ?? []} />
              </>
            ) : (
              <p className="notice">
                {describe(detail.publication_state)}，不能将候选正文视为实际写入。
              </p>
            )}
          </section>
          {(detail.observed_documents?.length ?? 0) > 0 && (
            <Documents title="发布检查时观察到的正文" documents={detail.observed_documents!} />
          )}
        </>
      )}
      {(value.evidence?.length ?? 0) > 0 && (
        <section>
          <h4>修订依据</h4>
          {value.evidence!.map((evidence, index) => (
            <blockquote className="evidence-quote" key={index}>
              <p>{evidence.quote}</p>
              <small>{evidence.ref}</small>
            </blockquote>
          ))}
        </section>
      )}
      {value.proposed_issue_summary && (
        <section>
          <h4>提出的后续问题</h4>
          <p>{value.proposed_issue_summary.description}</p>
        </section>
      )}
      <RecordedTime value={summary.published_at} />
      <JsonDetails value={value} label="发布身份、材料范围与完整记录" />
    </section>
  );
}
