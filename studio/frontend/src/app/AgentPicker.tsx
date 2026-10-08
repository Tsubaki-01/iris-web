import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { post } from '../api/client';
import type { GenerationView, ProfileView, Schema } from '../api/types';
import { Button, Dialog, EmptyState, ErrorNotice } from '../components/Primitives';

export function AgentPicker({
  profiles,
  workspaces,
  generations,
  choose,
  configure,
  close,
}: {
  profiles: ProfileView[];
  workspaces: Schema['WorkspaceView'][];
  generations: GenerationView[];
  choose: (generation: GenerationView) => void;
  configure: (profile: ProfileView) => void;
  close: () => void;
}) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.workspace_id ?? '');
  const [workspacePath, setWorkspacePath] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const client = useQueryClient();
  const register = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      let id = workspaceId;
      if (!id) {
        const workspace = await post<Schema['WorkspaceView']>('/api/workspaces', {
          path: workspacePath,
        });
        id = workspace.workspace_id;
        setWorkspaceId(id);
      }
      const result = await post<{ profile: ProfileView }>('/api/profiles/import', {
        workspace_id: id,
        config_path: configPath,
        ...(title ? { title } : {}),
      });
      await client.invalidateQueries({ queryKey: ['app'] });
      configure(result.profile);
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="选择 Agent" onClose={close}>
      {profiles.length === 0 && (
        <EmptyState title="从自己的配置开始">
          登记本地工作区，导入 agent.yaml，再校验并采用。
        </EmptyState>
      )}
      {profiles.map((profile) => (
        <article className="record-card" key={profile.profile_id}>
          <div className="row-between">
            <h3>{profile.title}</h3>
            <Button onClick={() => configure(profile)}>配置</Button>
          </div>
          <p className="small muted break-word">{profile.config_path}</p>
          {generations
            .filter((item) => item.profile_id === profile.profile_id && item.state === 'ready')
            .map((generation) => (
              <Button key={generation.generation_id} onClick={() => choose(generation)}>
                使用实例 · {generation.generation_id.slice(-8)}
              </Button>
            ))}
        </article>
      ))}
      <details open={profiles.length === 0}>
        <summary>导入本地 Agent 配置</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void register();
          }}
        >
          <label>
            工作区
            <select value={workspaceId} onChange={(event) => setWorkspaceId(event.target.value)}>
              <option value="">登记新工作区</option>
              {workspaces.map((workspace) => (
                <option key={workspace.workspace_id} value={workspace.workspace_id}>
                  {workspace.title} · {workspace.path}
                </option>
              ))}
            </select>
          </label>
          {!workspaceId && (
            <label>
              本地工作区路径
              <input
                required
                value={workspacePath}
                onChange={(event) => setWorkspacePath(event.target.value)}
                placeholder="项目目录的绝对路径"
              />
            </label>
          )}
          <label>
            Agent 配置文件
            <input
              required
              value={configPath}
              onChange={(event) => setConfigPath(event.target.value)}
              placeholder="agent.yaml 的路径"
            />
          </label>
          <label>
            显示名称（可选）
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <ErrorNotice error={error} />
          <Button variant="primary" disabled={busy}>
            导入并打开配置
          </Button>
        </form>
      </details>
    </Dialog>
  );
}
