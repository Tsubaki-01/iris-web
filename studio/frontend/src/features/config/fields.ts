export interface ConfigField {
  label: string;
  path: string;
  kind?: 'number' | 'boolean' | 'yaml' | 'textarea';
  help?: string;
}
export const configGroups: { title: string; description: string; fields: ConfigField[] }[] = [
  {
    title: '基础与模型',
    description: '模型路由、请求参数与会话存储。',
    fields: [
      { label: 'Agent 名称', path: 'name' },
      {
        label: '模型声明',
        path: 'model',
        kind: 'yaml',
        help: '支持 provider/name 短写或完整模型参数。',
      },
      { label: '会话存储', path: 'session', kind: 'yaml' },
    ],
  },
  {
    title: '指令与当前状态',
    description: 'system 与 context 二选一。动态状态来自宿主，不写入虚构字段。',
    fields: [
      { label: '系统指令', path: 'system', kind: 'textarea' },
      { label: '结构化 Context', path: 'context', kind: 'yaml' },
      { label: '项目模板', path: 'prompts', kind: 'yaml' },
    ],
  },
  {
    title: '上下文',
    description: '按完整请求估算输入预算；80% 压力线由内核固定。',
    fields: [
      { label: '压缩策略与预算', path: 'compaction', kind: 'yaml' },
      { label: '原文回读策略', path: 'context_policy', kind: 'yaml' },
    ],
  },
  {
    title: '工具与方法',
    description: '声明目录；每步采用的实际工具 schema 在观察栏查看。',
    fields: [
      { label: '工具与子 Agent', path: 'tools', kind: 'yaml' },
      { label: 'MCP', path: 'mcp', kind: 'yaml' },
      { label: 'Skills', path: 'skills', kind: 'yaml' },
      { label: 'Decision', path: 'decision', kind: 'yaml' },
      { label: 'Hooks', path: 'hooks', kind: 'yaml' },
      { label: 'Middleware', path: 'middleware', kind: 'yaml' },
    ],
  },
  {
    title: '执行环境',
    description: '工作区、权限和 Native / Docker 命令环境。',
    fields: [
      { label: '权限与工作区', path: 'permissions', kind: 'yaml' },
      { label: '命令执行', path: 'command', kind: 'yaml' },
    ],
  },
  {
    title: '长期记忆',
    description: 'namespace、概览、读写与可选生成策略。',
    fields: [{ label: 'Memory', path: 'memory', kind: 'yaml' }],
  },
  {
    title: '项目经验与维护',
    description: '共享维护参数作用于同一协调器的全部实例。自动新材料默认等待 10 个合格新 Run。',
    fields: [
      { label: '项目经验与修订目标', path: 'evolution', kind: 'yaml' },
      { label: '共享维护', path: 'maintenance', kind: 'yaml' },
    ],
  },
  {
    title: 'Goal / Todo',
    description: '长期目标轮数独立于单 Run 限额；Todo 是当前文件清单。',
    fields: [
      { label: '长期目标', path: 'goal', kind: 'yaml' },
      { label: '待办清单', path: 'todo', kind: 'yaml' },
    ],
  },
  {
    title: '观测与媒体',
    description: '内容采集、OTel 与 ASR；凭据沿现有宿主配置读取。',
    fields: [
      { label: '观测与正文采集', path: 'observability', kind: 'yaml' },
      { label: '语音输入', path: 'speech', kind: 'yaml' },
    ],
  },
];
