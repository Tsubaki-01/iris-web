<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { withBase } from 'vitepress';
import snippets from '../../.generated/home-snippets.json';
import metadata from '../../.generated/metadata.json';

const copied = ref(false);
const copyError = ref(false);
let resetTimer: ReturnType<typeof setTimeout>;
async function copyInstall(): Promise<void> {
  try {
    await navigator.clipboard.writeText(snippets.install);
    copied.value = true;
    copyError.value = false;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { copied.value = false; }, 1200);
  } catch {
    copyError.value = true;
  }
}
onUnmounted(() => clearTimeout(resetTimer));
const principles = [
  { title: 'Local first', lines: ['从你熟悉的本地环境开始，', '掌控自己的项目与开发节奏。'] },
  { title: 'Config first', lines: ['用简洁的 YAML 声明 Agent，', '专注于任务与行为。'] },
  { title: 'Python native', lines: ['以 Python 为核心，轻松接入', '你现有的工具与应用。'] },
];
</script>

<template>
  <div id="top" class="iris-landing">
    <section class="iris-hero" aria-labelledby="hero-title">
      <img class="blueprint-grid" :src="withBase('/brand/blueprint-grid.svg')" width="1498" height="843" alt="">
      <div class="hero-layout">
        <div class="hero-copy">
          <h1 id="hero-title" class="hero-headline"><img :src="withBase('/brand/headline.png')" alt="Locally rooted. Agents your way."></h1>
          <p class="hero-description">Iris is a local-first, configuration-first<br>agent kit for Python developers.</p>
          <div class="hero-install">
            <span aria-hidden="true" class="prompt">$</span>
            <code>{{ snippets.install.split('\n')[0] }}</code>
            <button type="button" class="copy-install" aria-label="复制安装命令" @click="copyInstall">
              <img v-if="!copied" :src="withBase('/brand/copy.svg')" width="22" height="24" alt="">
              <span v-else>Copied</span>
            </button>
          </div>
          <p v-if="copyError" class="copy-error" role="status">复制未完成，请在下方终端中选择安装命令。</p>
          <span class="sr-only" role="status">{{ copied ? '安装命令已复制' : '' }}</span>
          <div class="hero-actions">
            <a class="iris-button primary" href="#explore">Get started</a>
            <a class="iris-button" :href="withBase('/docs/getting-started/quickstart.html')">Read the docs</a>
          </div>
        </div>
        <div class="hero-botanical">
          <img class="hero-flower" :src="withBase('/brand/iris-artwork.png')" width="661" height="709" alt="淡紫色鸢尾花植物插画">
        </div>
      </div>
      <img class="annotation-leaders" :src="withBase('/brand/annotation-leaders.svg')" width="1498" height="843" alt="">
      <span class="plant-label label-local">Local First</span>
      <span class="plant-label label-config">Config First</span>
      <span class="plant-label label-python">Python Native</span>
      <span class="specimen specimen-top">IRIS<br>SPECIMEN 001<br>I. GERMANICA</span>
      <span class="specimen specimen-left">NATURAL<br>STRUCTURES<br>INTELLIGENT<br>SYSTEMS</span>
      <span class="specimen specimen-right">LOCAL<br>COMPUTE<br>BRIGHTER<br>AGENTS</span>
    </section>

    <section id="explore" class="iris-explore" aria-labelledby="explore-title">
      <header class="explore-heading">
        <h2 id="explore-title">A kit you can shape</h2>
        <span class="specimen explore-note">SMALL<br>AGENTS<br>BIGGER<br>POSSIBILITIES</span>
      </header>
      <div class="explore-grid">
        <div class="getting-started-demo">
          <div class="iris-terminal" aria-label="Iris 入门演示">
            <div class="terminal-toolbar"><img :src="withBase('/brand/window-dots.svg')" width="65" height="15" alt=""><span>~/Iris</span><small>示意</small></div>
            <div class="terminal-body">
              <div class="terminal-transcript">
                <pre class="terminal-install"><code>{{ snippets.install }}</code></pre>
                <p class="terminal-prerequisite">配置模型凭据与 agent.yaml 后运行：</p>
                <pre><code>{{ snippets.run }}</code></pre>
                <p class="terminal-question">Iris 是什么？</p>
                <p class="terminal-answer">assistant › Iris 是一个本地优先的 Python Agent Kit，<br>用 YAML 声明 Agent，用 Python 接入自己的应用。</p>
              </div>
              <img class="terminal-flower" :src="withBase('/brand/iris-artwork.png')" width="312" height="335" alt="" loading="lazy">
              <p class="terminal-input" aria-hidden="true">› 发送消息…</p>
            </div>
          </div>
          <div class="agent-config"><span>agent.yaml</span><pre><code>{{ snippets['minimal-agent'] }}</code></pre></div>
          <p class="demo-note">本地优先不代表离线推理；运行需要模型服务凭据。<a :href="withBase('/docs/getting-started/quickstart.html')">查看完整配置与运行步骤 →</a></p>
        </div>
        <div class="principles">
          <article v-for="(principle, index) in principles" :key="principle.title" class="principle">
            <span class="principle-number">0{{ index + 1 }}</span>
            <div class="principle-copy"><h3>{{ principle.title }}</h3><p><span v-for="line in principle.lines" :key="line">{{ line }}</span></p></div>
          </article>
          <a class="iris-text-link view-github" href="https://github.com/Tsubaki-01/Iris" target="_blank" rel="noreferrer">View on GitHub ↗</a>
        </div>
      </div>
      <footer class="landing-footer"><span>{{ metadata.version || '开发预览 · 内容尚未发布' }}</span><a class="iris-text-link" href="#top">Back to top ↑</a></footer>
    </section>
  </div>
</template>
