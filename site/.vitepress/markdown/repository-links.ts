import { statSync } from 'node:fs';
import path from 'node:path';
import type { MarkdownRenderer } from 'vitepress';

interface SourceContext {
  sourceRoot: string;
  sourceCommit: string;
}

/** 保留文档内链接，只将指向仓库其余部分的链接投影到同版 GitHub 源码。 */
export function repositoryLinks(md: MarkdownRenderer, context: SourceContext): void {
  md.core.ruler.after('inline', 'iris-repository-links', (state) => {
    const page = state.env.relativePath as string | undefined;
    if (!page?.startsWith('docs/')) return;
    for (const block of state.tokens) {
      for (const token of block.children || []) {
        if (token.type !== 'link_open') continue;
        const href = token.attrGet('href');
        if (!href || /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) continue;
        const [, pathname, suffix] = href.match(/^([^?#]*)(.*)$/)!;
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(page), decodeURIComponent(pathname)));
        if (target.startsWith('docs/')) continue;
        const type = statSync(path.resolve(context.sourceRoot, target)).isDirectory() ? 'tree' : 'blob';
        const encoded = target.split('/').map(encodeURIComponent).join('/');
        token.attrSet('href', `https://github.com/Tsubaki-01/Iris/${type}/${context.sourceCommit}/${encoded}${suffix}`);
      }
    }
  });
}
