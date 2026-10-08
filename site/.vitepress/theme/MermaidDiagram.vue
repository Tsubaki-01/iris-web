<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue';

const props = defineProps<{ graph: string }>();
const diagramId = 'iris-' + useId();
const svg = ref('');
const error = ref('');

async function renderDiagram(): Promise<void> {
  try {
    const mermaid = (await import('mermaid')).default;
    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#e7e1ec', primaryTextColor: '#302252', primaryBorderColor: '#715c9d', lineColor: '#827991', fontFamily: 'Noto Sans SC Variable, sans-serif' } });
    const result = await mermaid.render(diagramId, decodeURIComponent(props.graph));
    svg.value = result.svg;
    error.value = '';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}
onMounted(renderDiagram);
watch(() => props.graph, renderDiagram);
</script>

<template>
  <div class="iris-diagram">
    <p v-if="error" role="alert">图表无法渲染：{{ error }}</p>
    <div v-else-if="svg" v-html="svg"></div>
    <p v-else class="diagram-loading">正在绘制图表…</p>
  </div>
</template>
