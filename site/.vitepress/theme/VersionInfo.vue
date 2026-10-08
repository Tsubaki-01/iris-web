<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import metadata from '../../.generated/metadata.json';
import navigation from '../../.generated/navigation.json';

defineProps<{ placement: 'heading' | 'source' | 'footer' }>();
const { page } = useData();
const currentPath = computed(() => '/' + page.value.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '.html'));
const group = computed(() => navigation.find((entry) => entry.items.some((item) => item.link === currentPath.value)));
const label = computed(() => group.value?.items.find((item) => item.link === currentPath.value)?.text);
const sourceUrl = computed(() => `https://github.com/Tsubaki-01/Iris/blob/${metadata.sourceCommit}/${page.value.relativePath}`);
const editUrl = computed(() => `https://github.com/Tsubaki-01/Iris/edit/master/${page.value.relativePath}`);
</script>

<template>
  <div v-if="placement === 'heading'" class="iris-doc-heading">
    <p class="iris-breadcrumb">{{ group?.text }}<span aria-hidden="true"> / </span>{{ label }}</p>
    <span class="iris-version" :title="metadata.contentMode === 'preview' ? '本地内容尚未发布' : '文档对应此正式版本'">{{ metadata.version || '开发预览' }}</span>
  </div>
  <div v-else class="iris-source-links" :class="{ 'iris-source-footer': placement === 'footer' }">
    <a :href="sourceUrl" target="_blank" rel="noreferrer">查看{{ metadata.version ? '本版' : '已提交' }}源码 ↗</a>
    <a :href="editUrl" target="_blank" rel="noreferrer">编辑此页 ↗</a>
    <small>{{ metadata.version ? '修改随后续版本发布。' : '开发预览可能包含未提交的内容。' }}</small>
  </div>
</template>
