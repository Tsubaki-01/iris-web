import { defineAsyncComponent, h } from 'vue';
import { withBase } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import IrisHome from './IrisHome.vue';
import VersionInfo from './VersionInfo.vue';
import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-sc';
import '@fontsource-variable/noto-serif-sc';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import './styles.css';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h('a', { class: 'iris-github', href: 'https://github.com/Tsubaki-01/Iris', target: '_blank', rel: 'noreferrer' }, [
      h('img', { src: withBase('/brand/github.svg'), width: 20, height: 20, alt: '' }), 'GitHub',
    ]),
    'sidebar-nav-before': () => h('p', { class: 'documentation-label' }, 'DOCUMENTATION'),
    'doc-before': () => h(VersionInfo, { placement: 'heading' }),
    'aside-outline-after': () => h(VersionInfo, { placement: 'source' }),
    'doc-footer-before': () => h(VersionInfo, { placement: 'footer' }),
  }),
  enhanceApp({ app }) {
    app.component('IrisHome', IrisHome);
    app.component('Mermaid', defineAsyncComponent(() => import('./MermaidDiagram.vue')));
  },
} satisfies Theme;
