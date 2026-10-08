import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigDraft, ProfileView } from '../src/api/types';
import { ConfigDialog } from '../src/features/config/ConfigDialog';
vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange }: { value: string; onChange: (text: string) => void }) => (
    <textarea
      aria-label="YAML 源文档"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const profile: ProfileView = {
  profile_id: 'profile',
  workspace_id: 'workspace',
  title: 'Agent',
  config_path: 'agent.yaml',
  saved_revision_id: 'saved',
  latest_generation_id: null,
};
const original = 'name: Agent\nmodel: openai/original\nsystem: Helpful\n';
const initial: ConfigDraft = {
  profile_id: 'profile',
  draft_revision: 1,
  documents: [
    {
      document_id: 'agent',
      kind: 'agent',
      original_path: 'agent.yaml',
      base_text: original,
      draft_text: original,
      draft_revision: 1,
    },
  ],
};
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('config actions consume the latest field edit', () => {
  it('allows source editing to replace an invalid field draft before validating and saving', async () => {
    let draft = initial;
    const writes: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (path: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          const body = JSON.parse(String(init.body));
          draft = {
            ...draft,
            draft_revision: 2,
            documents: [{ ...draft.documents[0], draft_text: body.documents[0].text }],
          };
        }
        if (path.endsWith('/validate')) {
          writes.push('validate');
          return Response.json({
            valid: true,
            diagnostics: [],
            checked_scope: ['agent'],
            effective_agent_config: null,
          });
        }
        if (path.endsWith('/save')) {
          writes.push('save');
          return Response.json({ config_revision_id: 'fixed', draft });
        }
        return Response.json(draft);
      }),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ConfigDialog profile={profile} generations={[]} close={() => {}} adopted={() => {}} />
      </QueryClientProvider>,
    );
    const user = userEvent.setup();
    const field = await screen.findByLabelText('模型声明');
    await user.clear(field);
    await user.type(field, 'provider: [[unfinished');
    await user.click(screen.getByRole('button', { name: '完整 YAML' }));
    const source = screen.getByLabelText('YAML 源文档');
    await user.clear(source);
    await user.type(source, 'name: Correct\nmodel: openai/fixed\nsystem: Helpful\n');
    await user.click(screen.getByRole('button', { name: '校验声明' }));
    expect(await screen.findByText('声明校验通过')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '保存文件' }));
    await waitFor(() => expect(writes).toEqual(['validate', 'save']));
    expect(draft.documents[0].draft_text).toContain('openai/fixed');
  });
  it('preserves an invalid YAML field and does not save its previous valid value', async () => {
    const fetchMock = vi.fn(async () => Response.json(initial));
    vi.stubGlobal('fetch', fetchMock);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ConfigDialog profile={profile} generations={[]} close={() => {}} adopted={() => {}} />
      </QueryClientProvider>,
    );
    const input = await screen.findByLabelText('模型声明');
    const user = userEvent.setup();
    await user.clear(input);
    await user.type(input, 'provider: [[unfinished');
    await user.click(screen.getByRole('button', { name: '保存文件' }));
    expect((input as HTMLTextAreaElement).value).toBe('provider: [unfinished');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });
  for (const action of ['校验声明', '保存文件'])
    it(`edits a field then directly clicks ${action} once`, async () => {
      let saved = initial;
      const calls: { method: string; path: string; body: unknown }[] = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(async (path: string, init?: RequestInit) => {
          const body = init?.body ? JSON.parse(String(init.body)) : null;
          calls.push({ method: init?.method ?? 'GET', path, body });
          if (init?.method === 'PUT')
            saved = {
              ...saved,
              draft_revision: 2,
              documents: [
                { ...saved.documents[0], draft_text: body.documents[0].text, draft_revision: 2 },
              ],
            };
          if (path.endsWith('/validate'))
            return Response.json({
              valid: saved.draft_revision > 1,
              checked_scope: ['agent'],
              diagnostics:
                saved.draft_revision > 1
                  ? []
                  : [
                      {
                        document_id: 'agent',
                        path: 'model',
                        message: '模型配置有误',
                        severity: 'error',
                      },
                    ],
              effective_agent_config: null,
            });
          if (path.endsWith('/save'))
            return Response.json({
              config_revision_id: 'new-revision',
              saved_document_ids: ['agent'],
              draft: {
                ...saved,
                documents: saved.documents.map((item) => ({ ...item, base_text: item.draft_text })),
              },
            });
          return Response.json(saved);
        }),
      );
      render(
        <QueryClientProvider client={new QueryClient()}>
          <ConfigDialog profile={profile} generations={[]} close={() => {}} adopted={() => {}} />
        </QueryClientProvider>,
      );
      const input = await screen.findByLabelText('模型声明');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: '校验声明' }));
      expect(await screen.findByText(/模型配置有误/)).toBeTruthy();
      await user.clear(input);
      await user.type(input, 'openai/changed');
      expect(screen.queryByText(/模型配置有误/)).toBeNull();
      await user.click(screen.getByRole('button', { name: action }));
      await waitFor(() => expect(calls.some((call) => call.method === 'PUT')).toBe(true));
      const put = calls.find((call) => call.method === 'PUT')!;
      expect(JSON.stringify(put.body)).toContain('openai/changed');
      const submit = [...calls]
        .reverse()
        .find((call) => call.path.endsWith(action === '校验声明' ? '/validate' : '/save'))!;
      expect(submit.body).toMatchObject({ draft_revision: 2 });
      if (action === '校验声明') expect(await screen.findByText('声明校验通过')).toBeTruthy();
    });
});
