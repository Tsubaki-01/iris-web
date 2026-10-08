import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Schema } from '../src/api/types';
import { ContextPreparationView } from '../src/features/inspection/ContextPanel';
import { ModelCallView } from '../src/features/inspection/ModelPanel';
import { RunSummary } from '../src/features/inspection/RunPanel';
import { PublicationView } from '../src/features/learning/PublicationView';
import { KnowledgeRecords, MemoryItemView } from '../src/features/learning/KnowledgeRecords';
import context from './fixtures/context-preparation.json';
import model from './fixtures/model-call.json';
import run from './fixtures/run-view.json';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('readable observation evidence', () => {
  it('shows each real context stage in order with whole-request token counts', () => {
    render(<ContextPreparationView value={context as Schema['ContextPreparation']} />);
    const stages = screen.getAllByRole('listitem');
    expect(stages).toHaveLength(7);
    expect(stages[0].textContent).toContain('1. 组装请求');
    expect(stages[6].textContent).toContain('7. 最终请求');
    expect(stages[1].textContent).toContain('1,618 → 1,618');
    expect(stages[1].textContent).toContain('低于压力线');
    expect(screen.getByText('最终请求 tokens').nextElementSibling?.textContent).toBe('1,618');
    expect(screen.getByText('来源身份、保护引用与完整记录').closest('details')?.open).toBe(false);
  });
  it('renders actual captured messages and tools without treating reasoning as an answer', () => {
    render(<ModelCallView value={model as Schema['ModelCallRecord']} />);
    expect(screen.getByText("I'll start by reading the input file.")).toBeTruthy();
    expect(screen.getByText('调用 read_file')).toBeTruthy();
    expect(screen.getByText('已采集思考').closest('details')?.open).toBe(false);
    expect(screen.getByText('输入 tokens').nextElementSibling?.textContent).toBe('1,961');
  });
  it('shows the recorded run outcome and committed usage ahead of its identifiers', () => {
    render(<RunSummary view={run as Schema['RunView']} />);
    expect(screen.getByText('已结束')).toBeTruthy();
    expect(screen.getByText('模型步骤').nextElementSibling?.textContent).toContain(
      String(run.run.usage.model_steps_committed),
    );
    expect(screen.getByText('实际总 tokens').nextElementSibling?.textContent).toBe(
      run.run.usage.total_tokens.toLocaleString('zh-CN'),
    );
    expect(screen.getByText('身份、限额与完整运行记录').closest('details')?.open).toBe(false);
  });
  it('leads with memory text and preserves its actual evidence separately', () => {
    render(
      <MemoryItemView
        value={
          {
            id: 'memory-real',
            text: '用户偏好中文解释',
            namespace: 'project',
            category: 'user',
            kind: 'preference',
            status: 'active',
            source_type: 'sdk',
            source_id: 'record-real',
            reason: '用户明确表达偏好',
            evidence: [
              {
                kind: 'episode',
                source_id: 'episode-real',
                record_id: 'record-real',
                start: 0,
                end: 12,
              },
            ],
          } as Schema['MemoryItem']
        }
      />,
    );
    expect(screen.getByText('用户偏好中文解释')).toBeTruthy();
    expect(screen.getByText('支持证据').closest('details')?.open).toBe(false);
  });
  it('never presents an unconfirmed candidate as the published after document', () => {
    const value = {
      summary: {
        publication_id: 'p',
        stage: 'revision',
        description: '优化摘要',
        status: 'updated',
        publication_state: 'unconfirmed',
        detail_status: 'available',
      },
      detail: {
        publication_state: 'unconfirmed',
        before_documents: [{ path: 'prompt.md', text: 'before text' }],
        candidate_documents: [{ path: 'prompt.md', text: 'candidate text' }],
        observed_documents: [],
      },
      evidence: [{ ref: 'run:real', quote: '真实引用的证据' }],
    } as unknown as Schema['PublicationHistoryEntry'];
    render(<PublicationView value={value} />);
    expect(screen.getByText('before text')).toBeTruthy();
    expect(screen.getByText('candidate text')).toBeTruthy();
    expect(screen.getByText('发布未确认，不能将候选正文视为实际写入。')).toBeTruthy();
    expect(screen.queryByText('已确认写入')).toBeNull();
  });
  it('keeps expired publication summaries and evidence visible', () => {
    render(
      <PublicationView
        value={
          {
            summary: {
              publication_id: 'p',
              publication_state: 'confirmed',
              detail_status: 'expired',
              reason: '已完成发布',
            },
            detail: null,
            evidence: [{ ref: 'run:real', quote: '仍保留的依据' }],
          } as unknown as Schema['PublicationHistoryEntry']
        }
      />,
    );
    expect(screen.getByText('详情已过期')).toBeTruthy();
    expect(screen.getByText('仍保留的依据')).toBeTruthy();
    expect(screen.queryByText('候选正文')).toBeNull();
  });
  it('uses RevisionRequestSummary.id to open a real request instead of an invented revision_id', async () => {
    const fetchMock = vi.fn(async (path: string) =>
      Response.json(
        path.endsWith('/requests')
          ? {
              items: [
                {
                  id: 'request-real',
                  description: '改善项目提示',
                  status: null,
                  created_at: '2026-10-08T00:00:00Z',
                  targets: [],
                },
              ],
              next_cursor: null,
            }
          : { description: '改善项目提示', targets: [] },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <KnowledgeRecords path="/resource/evolution" kind="evolution" tab="requests" />
      </QueryClientProvider>,
    );
    fireEvent.click(await screen.findByText('改善项目提示'));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/resource/evolution/requests/request-real',
        expect.anything(),
      ),
    );
  });
});
