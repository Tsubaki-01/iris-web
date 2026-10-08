import { defineConfig } from 'vitepress';
import { MermaidMarkdown } from 'vitepress-plugin-mermaid';
import navigation from '../.generated/navigation.json';
import metadata from '../.generated/metadata.json';
import buildContext from '../.generated/build-context.json';
import { repositoryLinks } from './markdown/repository-links';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Iris',
  description: '本地优先、配置优先的 Python Agent Kit。用 YAML 声明 Agent，用 Python 接入自己的应用。',
  base: '/iris-web/',
  cleanUrls: false,
  lastUpdated: false,
  appearance: false,
  head: [['link', { rel: 'icon', href: '/iris-web/brand/iris-wordmark.png' }]],
  themeConfig: {
    logo: { src: '/brand/iris-wordmark.png', alt: 'Iris 首页' },
    siteTitle: false,
    nav: [
      { text: 'Explore', link: '/#explore' },
      { text: 'Docs', link: '/docs/getting-started/quickstart', activeMatch: '/docs/' },
      { text: 'Feedback', link: 'https://github.com/Tsubaki-01/Iris/issues', noIcon: true },
    ],
    sidebar: { '/docs/': navigation },
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '文档导航',
    returnToTopLabel: '返回顶部',
    outlineTitle: '本页内容',
    darkModeSwitchLabel: '切换主题',
    search: {
      provider: 'local',
      options: {
        translations: { button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' }, modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } },
        miniSearch: {
          options: {
            tokenize: (text: string): string[] => Array.from(new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)).filter((part) => part.isWordLike).map((part) => part.segment),
          },
        },
      },
    },
    notFound: { title: '这页不在这里', quote: '从文档或首页继续探索 Iris。', linkLabel: '返回首页' },
  },
  markdown: {
    theme: 'github-light',
    config: (md) => {
      md.use(MermaidMarkdown);
      repositoryLinks(md, { ...buildContext, sourceCommit: metadata.sourceCommit });
    },
  },
});
