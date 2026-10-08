import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { editYamlField } from '../src/features/config/yaml';

describe('source document edits', () => {
  it('preserves untouched comments and relative paths', () => {
    const source =
      '# 项目 Agent\nname: old # 保留名称说明\ncontext:\n  path: ./context.yaml # 相对引用\nmodel: openai/test\n';
    const result = editYamlField(source, ['name'], 'new');
    expect(result).toContain('# 项目 Agent');
    expect(result).toContain('name: new # 保留名称说明');
    expect(result).toContain('path: ./context.yaml # 相对引用');
    expect(parse(result).name).toBe('new');
  });
  it('does not replace invalid source documents', () => {
    expect(() => editYamlField('name: [broken', ['name'], 'new')).toThrow();
  });
});
