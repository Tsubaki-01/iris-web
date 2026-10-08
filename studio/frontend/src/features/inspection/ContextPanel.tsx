import type { Schema } from '../../api/types';
import { EmptyState, ErrorNotice, JsonDetails } from '../../components/Primitives';
import { RecordList, RemoteRecord } from './RecordList';
import { count, describe, Stat, Status } from './Presentation';

export function ContextPreparationView({ value }: { value: Schema['ContextPreparation'] }) {
  return (
    <section>
      <dl className="summary-stats">
        <Stat label="最终请求 tokens">{count(value.final_input_tokens)}</Stat>
        <Stat label="输入预算">{count(value.input_budget_tokens)}</Stat>
        <Stat label="压力触发线">{count(value.trigger_tokens)}</Stat>
      </dl>
      <p className="muted small">下列数值是每个阶段的完整请求量，阶段之间不相加。</p>
      <ol className="context-stages">
        {(value.stages ?? []).map((stage) => (
          <li key={stage.index}>
            <div className="row-between">
              <strong>
                {stage.index + 1}. {describe(stage.kind)}
              </strong>
              <Status value={stage.outcome} />
            </div>
            <p className="token-transition">
              {count(stage.before_input_tokens)} <span aria-label="变为">→</span>{' '}
              {count(stage.after_input_tokens)} <small>tokens</small>
            </p>
            {(stage.decisions ?? []).map((decision, index) => (
              <div className="context-decision" key={index}>
                <strong>
                  {describe(decision.action)} · {decision.subject_ref}
                </strong>
                <span>{describe(decision.reason_code)}</span>
                {decision.related_ref && <code>{decision.related_ref}</code>}
              </div>
            ))}
            {stage.compaction_ref && (
              <p className="muted small break-word">压缩记录：{stage.compaction_ref}</p>
            )}
          </li>
        ))}
      </ol>
      {(value.selected_tool_names?.length ?? 0) > 0 && (
        <section>
          <h4>本步实际采用工具</h4>
          <div className="tag-list">
            {value.selected_tool_names!.map((name) => (
              <code key={name}>{name}</code>
            ))}
          </div>
        </section>
      )}
      {(value.selected_contribution_keys?.length ?? 0) > 0 && (
        <section>
          <h4>实际采用上下文</h4>
          <p className="break-word">{value.selected_contribution_keys!.join(' · ')}</p>
        </section>
      )}
      <ErrorNotice error={value.error?.message} />
      <JsonDetails value={value} label="来源身份、保护引用与完整记录" />
    </section>
  );
}
export function ContextPanel({ path, store }: { path: string; store: string }) {
  return (
    <RecordList<Schema['ContextPreparationSummary']>
      path={`${path}/preparations`}
      identify={(item) => item.preparation_id}
      summary={(item) => (
        <>
          <strong>步骤 {item.step_index} · 上下文准备</strong>
          <span>
            <Status value={item.phase} /> 最终 {count(item.final_input_tokens)} tokens
          </span>
        </>
      )}
      detail={(item) => (
        <RemoteRecord<Schema['Observation_ContextPreparation_']>
          path={`/api/stores/${store}/preparations/${item.preparation_id}`}
        >
          {(record) =>
            record.status === 'available' && record.data ? (
              <ContextPreparationView value={record.data} />
            ) : (
              <EmptyState title={describe(record.status)}>{record.reason}</EmptyState>
            )
          }
        </RemoteRecord>
      )}
    />
  );
}
