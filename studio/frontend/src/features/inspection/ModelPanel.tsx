import type { Schema } from '../../api/types';
import { EmptyState, JsonDetails } from '../../components/Primitives';
import { count, describe, RecordedTime, Stat, Status, TextDocument } from './Presentation';
import { RecordList, RemoteRecord } from './RecordList';

/** 对应 Iris observability.content 保存的 provider-neutral 内容投影。 */
type CapturedPart =
  | { type: 'text'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'uri'; uri: string; mime_type: string; modality: string }
  | { type: 'tool_call'; id: string; name: string; arguments: unknown }
  | { type: 'tool_call_response'; id: string; response: { parts: CapturedPart[] } };
type CapturedMessage = { role: string; parts: CapturedPart[] };
type CapturedTool = { name: string; description: string; parameters: unknown };

function CapturedParts({ parts }: { parts: CapturedPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.type === 'text' ? (
          <pre className="captured-text" key={index}>
            {part.content}
          </pre>
        ) : part.type === 'reasoning' ? (
          <details key={index}>
            <summary>已采集思考</summary>
            <pre>{part.content}</pre>
          </details>
        ) : part.type === 'tool_call' ? (
          <section className="tool-message" key={index}>
            <strong>调用 {part.name}</strong>
            <pre>{JSON.stringify(part.arguments, null, 2)}</pre>
          </section>
        ) : part.type === 'tool_call_response' ? (
          <section className="tool-message" key={index}>
            <strong>工具返回</strong>
            <CapturedParts parts={part.response.parts} />
          </section>
        ) : (
          <p className="small break-word" key={index}>
            图片模型副本 · {part.mime_type}
            <br />
            {part.uri}
          </p>
        ),
      )}
    </>
  );
}

function CapturedContent({
  title,
  observation,
  tools = false,
}: {
  title: string;
  observation: Schema['Observation_Any_'];
  tools?: boolean;
}) {
  return (
    <section className="capture-section">
      <h4>{title}</h4>
      {observation.status !== 'available' ? (
        <EmptyState title={describe(observation.status)}>{observation.reason}</EmptyState>
      ) : tools ? (
        (observation.data as CapturedTool[]).map((tool) => (
          <details className="tool-definition" key={tool.name}>
            <summary>{tool.name}</summary>
            <p>{tool.description}</p>
            <JsonDetails value={tool.parameters} label="实际参数 schema" open />
          </details>
        ))
      ) : (
        (observation.data as CapturedMessage[]).map((message, index) => (
          <article className="captured-message" key={index}>
            <span className="eyebrow">{message.role}</span>
            <CapturedParts parts={message.parts} />
          </article>
        ))
      )}
    </section>
  );
}

export function ModelCallView({ value }: { value: Schema['ModelCallRecord'] }) {
  return (
    <>
      <dl className="summary-stats">
        <Stat label="用途">{describe(value.summary.purpose)}</Stat>
        <Stat label="实际响应模型">{value.summary.response_model ?? '未记录'}</Stat>
        <Stat label="输入 tokens">{count(value.summary.input_tokens)}</Stat>
        <Stat label="输出 tokens">{count(value.summary.output_tokens)}</Stat>
      </dl>
      {value.truncated_fields.length > 0 && (
        <div className="notice">
          以下字段达到采集长度上限，完整正文不可用：{value.truncated_fields.join('、')}
        </div>
      )}
      <CapturedContent title="实际请求消息" observation={value.input} />
      <CapturedContent title="本次工具定义" observation={value.tool_definitions} tools />
      <CapturedContent title="实际模型输出" observation={value.output} />
      {Object.entries(value.previews).map(([key, preview]) => (
        <TextDocument key={key} title={`${key} · 截断预览`} text={String(preview)} />
      ))}
      <JsonDetails value={value} label="Trace、来源关联与完整调用记录" />
    </>
  );
}

export function ModelPanel({ store, run }: { store: string; run: string }) {
  return (
    <RecordList<Schema['ModelCallSummary']>
      path={`/api/evidence/model-calls?store_binding_id=${store}&run_id=${run}`}
      identify={(item) => item.record_id}
      summary={(item) => (
        <>
          <strong>
            {describe(item.purpose)} · {item.request_model ?? '模型未记录'}
          </strong>
          <span>
            {item.step_index == null ? '步骤未记录' : `步骤 ${item.step_index}`}
            <Status value={item.outcome} />
          </span>
          <span className="muted small">
            输入 {count(item.input_tokens)} / 输出 {count(item.output_tokens)} tokens
          </span>
          <RecordedTime value={item.started_at} />
        </>
      )}
      detail={(item) => (
        <RemoteRecord<Schema['ModelCallRecord']>
          path={`/api/evidence/model-calls/${encodeURIComponent(item.record_id)}`}
        >
          {(value) => <ModelCallView value={value} />}
        </RemoteRecord>
      )}
    />
  );
}
