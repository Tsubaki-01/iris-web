import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import MarkdownIt from 'markdown-it';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const markdown = new MarkdownIt();

/** 从快速开始的具名区域读取首页代码，不维护第二份命令。 */
export function extractSnippets(source) {
  return Object.fromEntries(['install', 'minimal-agent', 'run'].map((name) => {
    const region = source.match(new RegExp(`<!-- iris-web:${name}:start -->([\\s\\S]*?)<!-- iris-web:${name}:end -->`));
    const blocks = region ? markdown.parse(region[1], {}).filter((token) => token.type === 'fence') : [];
    if (blocks.length !== 1) throw new Error(`quickstart.md 的 ${name} 区域必须包含一个代码块。`);
    return [name, blocks[0].content.trimEnd()];
  }));
}

/** 将已检出的 Iris 文档转换为网站构建输入；版本选择由调用方负责。 */
export async function prepareContent({ sourceRoot, siteRoot = resolve(projectRoot, 'site'), version = null, sourceCommit }) {
  sourceRoot = resolve(sourceRoot);
  siteRoot = resolve(siteRoot);
  const docsRoot = resolve(sourceRoot, 'docs');
  const navigation = JSON.parse(await readFile(resolve(docsRoot, 'navigation.json'), 'utf8'));
  const sidebar = await Promise.all(navigation.groups.map(async (group) => ({
    text: group.text,
    ...(group.text === '文档' || group.text === '开始使用' ? {} : { collapsed: true }),
    items: await Promise.all(group.items.map(async (item) => {
      const body = await readFile(resolve(docsRoot, item.path), 'utf8');
      const title = body.match(/^#\s+(.+)$/m)?.[1].trim();
      return { text: item.text || title, link: `/docs/${item.path.replace(/index\.md$/, '').replace(/\.md$/, '.html')}` };
    })),
  })));
  const snippets = extractSnippets(await readFile(resolve(docsRoot, 'getting-started/quickstart.md'), 'utf8'));
  const commit = sourceCommit || execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const metadata = { version, sourceCommit: commit, contentMode: version ? 'release' : 'preview' };

  // docs 是固定的生成目录，先替换它以清除源仓库已经删除的页面。
  const destination = resolve(siteRoot, 'docs');
  await rm(destination, { recursive: true, force: true });
  await cp(docsRoot, destination, { recursive: true });
  const generated = resolve(siteRoot, '.generated');
  await mkdir(generated, { recursive: true });
  for (const [name, value] of Object.entries({ metadata, navigation: sidebar, 'home-snippets': snippets, 'build-context': { sourceRoot } })) {
    await writeFile(resolve(generated, `${name}.json`), JSON.stringify(value, null, 2) + '\n');
  }
  return { pages: sidebar.reduce((count, group) => count + group.items.length, 0), ...metadata };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { source: { type: 'string' }, version: { type: 'string' } } });
  if (!values.source) throw new Error('请用 --source 指定 Iris 仓库目录，例如 --source ../Iris。');
  const result = await prepareContent({ sourceRoot: values.source, version: values.version });
  console.log(`已导入 ${result.pages} 篇文档 · ${result.version || '开发预览'} · ${result.sourceCommit}`);
}
