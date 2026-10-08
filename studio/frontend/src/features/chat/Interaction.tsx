import { useState } from 'react';
import type { SessionBootstrap } from '../../api/types';
import { Button, JsonDetails } from '../../components/Primitives';

type InteractionValue = NonNullable<
  NonNullable<NonNullable<SessionBootstrap['current_run']>['result']>['pending_interaction']
>;
export function Interaction({
  interaction,
  enabled,
  busy,
  respond,
}: {
  interaction: InteractionValue;
  enabled: boolean;
  busy: boolean;
  respond: (id: string, response: unknown) => Promise<void>;
}) {
  const [answer, setAnswer] = useState('');
  const prompt = interaction.request.prompt;
  return (
    <section className="interaction">
      <span className="eyebrow">需要你的确认</span>
      <h3>{prompt.kind === 'question' ? prompt.question : prompt.reason}</h3>
      <p className="muted">{interaction.request.tool_call.tool_name}</p>
      <JsonDetails value={interaction.request.tool_call.arguments} label="查看调用参数" />
      {prompt.kind === 'permission' ? (
        <div className="actions">
          <Button
            disabled={!enabled || busy}
            onClick={() =>
              void respond(interaction.interaction_id!, { kind: 'permission', decision: 'reject' })
            }
          >
            拒绝
          </Button>
          <Button
            variant="primary"
            disabled={!enabled || busy}
            onClick={() =>
              void respond(interaction.interaction_id!, { kind: 'permission', decision: 'approve' })
            }
          >
            允许执行
          </Button>
        </div>
      ) : (
        <>
          <div className="actions wrap">
            {(prompt.options ?? []).map((option) => (
              <Button
                key={option}
                disabled={!enabled || busy}
                onClick={() =>
                  void respond(interaction.interaction_id!, { kind: 'question', answer: option })
                }
              >
                {option}
              </Button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void respond(interaction.interaction_id!, { kind: 'question', answer });
            }}
          >
            <label>
              回答
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} />
            </label>
            <Button variant="primary" disabled={!enabled || busy || !answer.trim()}>
              提交回答
            </Button>
          </form>
        </>
      )}
      {!enabled && <p className="muted">等待会话完成收尾后即可回答。</p>}
    </section>
  );
}
