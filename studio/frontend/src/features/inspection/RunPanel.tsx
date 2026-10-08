import type { Control, Schema } from '../../api/types';
import { ErrorNotice, JsonDetails } from '../../components/Primitives';
import { RemoteRecord } from './RecordList';
import { count, describe, RecordedTime, Stat, Status } from './Presentation';

export function RunSummary({
  view,
  control,
}: {
  view: Schema['RunView'];
  control?: Control | null;
}) {
  const { run, result } = view;
  const interaction = result?.pending_interaction;
  return (
    <section className="run-summary">
      <div className="row-between">
        <h3>{describe(run.phase)}</h3>
        <Status value={run.stop_reason} />
      </div>
      <RecordedTime value={run.started_at} />
      <dl className="summary-stats">
        <Stat label="模型步骤">
          {count(run.usage.model_steps_committed)} / {count(run.limits.max_model_steps)}
        </Stat>
        <Stat label="已提交工具调用">{count(run.usage.tool_calls_committed)}</Stat>
        <Stat label="输入 tokens">{count(run.usage.input_tokens)}</Stat>
        <Stat label="输出 tokens">{count(run.usage.output_tokens)}</Stat>
        <Stat label="实际总 tokens">{count(run.usage.total_tokens)}</Stat>
        {control && <Stat label="进程驱动">{describe(control.driver_state)}</Stat>}
      </dl>
      {interaction && (
        <div className="notice">
          <strong>
            等待{interaction.request.prompt.kind === 'question' ? '你的回答' : '执行许可'}
          </strong>
          <p>
            {interaction.request.prompt.kind === 'question'
              ? interaction.request.prompt.question
              : interaction.request.prompt.reason}
          </p>
        </div>
      )}
      <ErrorNotice error={result?.error?.message} />
      {run.cancellation_requested_at && <p className="notice">已请求中断，等待运行收尾。</p>}
      <JsonDetails value={view} label="身份、限额与完整运行记录" />
    </section>
  );
}
export function RunPanel({ path, control }: { path: string; control?: Control | null }) {
  return (
    <RemoteRecord<Schema['RunView']> path={path}>
      {(view) => <RunSummary view={view} control={control} />}
    </RemoteRecord>
  );
}
