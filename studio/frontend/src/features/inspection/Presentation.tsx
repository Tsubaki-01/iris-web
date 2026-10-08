import type { ReactNode } from 'react';

const names: Record<string, string> = {
  active: '运行中',
  waiting: '等待交互',
  terminal: '已结束',
  completed: '已完成',
  cancelled: '已取消',
  failed: '失败',
  ready: '已就绪',
  preparing: '准备中',
  paused: '已暂停',
  applied: '已采用',
  skipped: '已跳过',
  candidate: '候选',
  rejected: '未采用',
  retained: '保留',
  replaced: '替换',
  removed: '移除',
  summarized: '摘要',
  unchanged: '保持不变',
  assemble: '组装请求',
  deduplicate: '内容去重',
  optional_context: '可选上下文',
  optional_tools: '可选工具',
  preview: '预览投影',
  compaction: '历史压缩',
  final: '最终请求',
  below_pressure: '低于压力线',
  required_tool: '必需工具',
  main: '主模型',
  experience: '项目经验',
  revision: '有限修订',
  capture: '捕获经历',
  flush: '提炼观察',
  dream: '整理知识',
  overview: '更新概览',
  updated: '已更新',
  no_change: '无需修改',
  empty: '没有可处理材料',
  conflict: '发生冲突',
  blocked: '受阻',
  confirmed: '发布已确认',
  unconfirmed: '发布未确认',
  not_published: '未发布',
  available: '详情可用',
  expired: '详情已过期',
  published: '已发布',
};
export function describe(value: string | null | undefined): string {
  return value == null ? '未记录' : (names[value] ?? value);
}
export function Status({ value }: { value: string | null | undefined }) {
  return <span className="badge">{describe(value)}</span>;
}
export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
export function count(value: number | null | undefined): string {
  return value == null ? '未记录' : value.toLocaleString('zh-CN');
}
export function RecordedTime({ value }: { value: string | null | undefined }) {
  return value ? (
    <time className="muted small" dateTime={value}>
      {new Date(value).toLocaleString()}
    </time>
  ) : null;
}
export function TextDocument({ title, text }: { title: string; text: string | null | undefined }) {
  return (
    <section className="text-document">
      <h4>{title}</h4>
      {text == null ? <p className="muted">当时未保存该文件正文。</p> : <pre>{text}</pre>}
    </section>
  );
}
