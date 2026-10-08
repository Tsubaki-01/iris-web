import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createMarkdownRenderer } from 'vitepress';
import { extractSnippets, prepareContent } from '../scripts/prepare-content.mjs';
import { repositoryLinks } from '../site/.vitepress/markdown/repository-links.ts';

const fixture = await mkdtemp(join(tmpdir(), 'iris-web-content-'));
const sourceRoot = join(fixture, 'source');
const siteRoot = join(fixture, 'site');
const commit = '0123456789abcdef0123456789abcdef01234567';
const snippet = (name, language, code) => `<!-- iris-web:${name}:start -->\n\`\`\`${language}\n${code}\n\`\`\`\n<!-- iris-web:${name}:end -->`;
const quickstart = '# 首次运行\n\n' + [snippet('install', 'sh', 'git clone https://github.com/Tsubaki-01/Iris.git\ncd Iris\nuv sync'), snippet('minimal-agent', 'yaml', 'name: first-agent'), snippet('run', 'sh', 'uv run iris chat agent.yaml')].join('\n\n');
await mkdir(join(sourceRoot, 'docs/getting-started'), { recursive: true });
await mkdir(join(sourceRoot, 'src/iris'), { recursive: true });
await mkdir(join(sourceRoot, 'evals'), { recursive: true });
await writeFile(join(sourceRoot, 'src/iris/runtime.py'), 'class Runtime: pass\n');
await writeFile(join(sourceRoot, 'evals/README.md'), '# Evals\n');
await writeFile(join(sourceRoot, 'docs/index.md'), '# Iris 文档\n');
await writeFile(join(sourceRoot, 'docs/getting-started/quickstart.md'), quickstart);
await writeFile(join(sourceRoot, 'docs/navigation.json'), JSON.stringify({ groups: [{ text: '开始使用', items: [{ path: 'index.md' }, { path: 'getting-started/quickstart.md', text: '快速开始' }] }] }));
after(() => rm(fixture, { recursive: true, force: true }));

test('导入保留源文档，首页代码与导航使用同一来源', async () => {
  const result = await prepareContent({ sourceRoot, siteRoot, sourceCommit: commit, version: 'v0.1.0' });
  assert.equal(result.pages, 2);
  assert.equal(result.contentMode, 'release');
  assert.equal(await readFile(join(sourceRoot, 'docs/getting-started/quickstart.md'), 'utf8'), quickstart);
  assert.equal(await readFile(join(siteRoot, 'docs/getting-started/quickstart.md'), 'utf8'), quickstart);
  const snippets = JSON.parse(await readFile(join(siteRoot, '.generated/home-snippets.json'), 'utf8'));
  assert.equal(snippets.install, 'git clone https://github.com/Tsubaki-01/Iris.git\ncd Iris\nuv sync');
  const navigation = JSON.parse(await readFile(join(siteRoot, '.generated/navigation.json'), 'utf8'));
  assert.deepEqual(navigation[0].items, [{ text: 'Iris 文档', link: '/docs/' }, { text: '快速开始', link: '/docs/getting-started/quickstart.html' }]);
});

test('重新导入更新示例并清除旧生成页面，不影响手写首页', async () => {
  await prepareContent({ sourceRoot, siteRoot, sourceCommit: commit });
  await writeFile(join(siteRoot, 'index.md'), '# 手写首页');
  await writeFile(join(siteRoot, 'docs/removed.md'), '# 已移除');
  await writeFile(join(sourceRoot, 'docs/getting-started/quickstart.md'), quickstart.replace('name: first-agent', 'name: updated-agent'));
  await prepareContent({ sourceRoot, siteRoot, sourceCommit: commit });
  await assert.rejects(stat(join(siteRoot, 'docs/removed.md')), { code: 'ENOENT' });
  assert.equal(await readFile(join(siteRoot, 'index.md'), 'utf8'), '# 手写首页');
  const data = JSON.parse(await readFile(join(siteRoot, '.generated/home-snippets.json'), 'utf8'));
  assert.equal(data['minimal-agent'], 'name: updated-agent');
  const metadata = JSON.parse(await readFile(join(siteRoot, '.generated/metadata.json'), 'utf8'));
  assert.equal(metadata.contentMode, 'preview');
  assert.equal(metadata.version, null);
});

test('首页引用区域缺失时指出源区域，不保留陈旧命令', () => {
  assert.throws(() => extractSnippets('# Quickstart'), /quickstart.md 的 install/);
});

const renderer = await createMarkdownRenderer(siteRoot, { config: (md) => repositoryLinks(md, { sourceRoot, sourceCommit: commit }) }, '/iris-web/');
test('文档链接保留中文锚点和参数，源码与目录对应同一提交', () => {
  const input = '[概览](../index.md#开始使用)\n\n[查询](quickstart.md?mode=read#准备环境)\n\n[文件](../../src/iris/runtime.py#L1)\n\n[目录](../../src/iris)\n\n[仓库说明][evals]\n\n[evals]: ../../evals/README.md\n\n```text\n../../src/iris/runtime.py\n```';
  const html = renderer.render(input, { relativePath: 'docs/getting-started/quickstart.md', path: join(siteRoot, 'docs/getting-started/quickstart.md') });
  const overview = new URL(html.match(/href="([^"]+)"/)[1], 'https://example.com/iris-web/docs/getting-started/quickstart.html');
  assert.equal(overview.pathname, '/iris-web/docs/');
  assert.equal(decodeURIComponent(overview.hash), '#开始使用');
  assert.match(html, /quickstart\.html\?mode=read#/);
  assert.ok(html.includes(`https://github.com/Tsubaki-01/Iris/blob/${commit}/src/iris/runtime.py#L1`));
  assert.ok(html.includes(`https://github.com/Tsubaki-01/Iris/tree/${commit}/src/iris`));
  assert.ok(html.includes(`https://github.com/Tsubaki-01/Iris/blob/${commit}/evals/README.md`));
  assert.ok(html.includes('../../src/iris/runtime.py</span>'));
});

test('页内锚点和外部地址保持语义', () => {
  const html = renderer.render('[当前](#准备环境) [外部](https://example.com/path?q=1#test) [邮件](mailto:hello@example.com)', { relativePath: 'docs/index.md', path: join(siteRoot, 'docs/index.md') });
  assert.match(html, /href="#/);
  assert.ok(html.includes('https://example.com/path?q=1#test'));
  assert.ok(html.includes('mailto:hello@example.com'));
});
