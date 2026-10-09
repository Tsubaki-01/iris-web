# Iris Studio

Iris 的本地 Agent 工作台，用于配置 Agent、运行任务、查看上下文与工具调用，并管理会话历史。

工作台以聊天为中心：左侧切换功能，右侧查看当前任务与资源状态。首次启动为空工作区，导入自己的 Agent YAML 后即可开始使用。

Studio 使用独立的 React 前端和 Python 后端，依赖本地 Iris 源码。官网开发与发布见[仓库 README](../README.md)。

## 安装与启动

需要 Node 24、Python 3.12+、uv，以及可用的模型服务凭据。将 Iris 源码仓库放在 iris-web 的相邻目录：

```text
parent/
  Iris/
  iris-web/
    studio/
      backend/
      frontend/
```

后端通过本地路径安装 Iris，依赖位置定义在 [`backend/pyproject.toml`](backend/pyproject.toml)。

### 1. 安装后端

在 `studio/backend` 执行：

```shell
uv sync --locked
uv run python scripts/export_contracts.py
```

### 2. 构建前端

在 `studio/frontend` 执行：

```shell
npm ci
npm run contracts:generate
npm run build
```

### 3. 启动工作台

按 [Iris 快速开始](https://github.com/Tsubaki-01/Iris/blob/master/docs/getting-started/quickstart.md#准备环境) 配置模型服务凭据。若将凭据保存在 Iris 仓库的 `.env` 文件中，在 `studio/backend` 执行：

```shell
uv run iris-studio --env-file ../../../Iris/.env
```

打开 [http://127.0.0.1:8000](http://127.0.0.1:8000)。后端同时提供前端页面与 API。已经在终端设置 Iris 凭据时可省略 `--env-file`；默认不会自动读取 `.env`。

| 参数 | 用途 | 默认值 |
| --- | --- | --- |
| `--port` | 监听端口 | `8000` |
| `--data-dir` | 工作台资料目录 | 启动目录中的 `.iris-studio` |
| `--env-file` | 加载模型等服务的环境变量文件 | 不自动加载 |

同一组工作区由单个后端进程管理。关闭浏览器后，已提交任务会继续运行；模型调用和联网工具仍使用配置中的服务。

## 完成第一个任务

准备一个工作目录，放入 `input.txt`，并将下面的配置保存为 `agent.yaml`。示例使用 DeepSeek；请按自己的服务配置调整 `model`。

```yaml
name: local-assistant
model:
  provider: deepseek
  name: deepseek-flash
  api_style: chat_completions
system: 根据实际文件完成用户任务，说明所依据的文件。
tools:
  builtin: [file.list, file.read, file.publish, human.ask]
permissions:
  workspace: .
  writes: confirm
session:
  backend: sqlite
  path: .iris/lifecycle.db
observability:
  enabled: true
  capture_content: true
```

在工作台中：

1. 选择 **Agent 配置**，登记本地工作区并导入 `agent.yaml`。配置中的相对路径以原配置文件所在目录为基准。
2. 在分组表单或完整 YAML 中编辑配置，点击 **校验声明**。有改动时先 **保存文件**，再 **采用为新实例**。
3. 新建会话，输入“读取 input.txt，总结其中的内容；有需要我决定的地方请先询问”。
4. 在聊天区查看回答、工具调用和待回答的问题；通过左侧入口查看上下文、工具与委派或模型调用，切换面板会保留当前聊天与草稿。

已有 Agent YAML 时可以直接导入。完整字段说明见 [Iris 配置参考](https://github.com/Tsubaki-01/Iris/blob/master/docs/reference/configuration.md)。

## 管理任务与会话

- **补充当前任务**用于调整正在运行的任务，**下一轮处理**用于安排后续输入。发出中断后，等待界面显示任务结束再继续操作。
- 需要人工回答时，在问题卡中作答；需要工具权限时，在对应卡片中选择允许或拒绝。
- 刷新页面会重新同步当前会话。后端重启后，尚在进程内排队的输入需要重新提交。
- 打开历史会话后可先浏览记录，再选择实例继续。有未完成任务时，使用 **显式恢复当前运行**；恢复和继续均使用该历史会话原有的存储。
- 修改配置后，**保存文件**写入 YAML，**采用为新实例**让后续任务使用新配置。已有实例继续使用原配置；若共享资源配置冲突，按提示退役占用实例后再采用。

## 查看运行与资源

上下文面板展示当前运行使用的内容、来源与计量。模型调用面板提供请求与响应记录，完整内容在该次调用结束后可读取；记录范围取决于 Agent 的观测配置，未采集或被截断的内容会在面板中标明。

Memory、Evolution、Goal/Todo 和语音功能需在 Agent 配置中启用：

- **Memory 与 Evolution**：查看记忆、经验及整理状态。自动整理会等待空闲时段和足够的新运行材料；“等待材料”表示尚未满足整理条件。Evolution 的发布记录可查看发布、确认和后续采用情况，完整详情受保留期限限制。
- **Goal 与 Todo**：查看目标进度并编辑当前 Todo Markdown。暂停目标会停止后续自动推进；要停止正在执行的任务，使用中断操作。
- **图片与产物**：查看会话图片和工具发布的文件。
- **语音输入**：配置 ASR 服务与凭据后使用，转录结果先进入草稿，确认后再发送。

## 导出运行记录

从 **记录与导出**选择运行及要保留的产物，也可选入仍在保留期内的 Evolution 发布详情。导出包包含 JSON 记录、图片、所选产物和只读页面，并注明记录范围与缺失内容。

解压后打开 `index.html` 即可离线浏览，无需启动 Studio。记录包用于查阅与分享，继续任务或恢复会话仍需回到工作台。

## 本地开发

完成依赖安装后，在两个终端分别启动后端和前端：

```shell
# studio/backend
uv run iris-studio --env-file ../../../Iris/.env

# studio/frontend
npm run dev
```

前端默认运行在 `http://127.0.0.1:5174`，将 `/api` 请求代理到后端的 `8000` 端口。使用终端环境变量配置凭据时，可省略 `--env-file`。

HTTP 与 SSE 类型由后端协议生成。修改协议后，在后端目录运行 `uv run python scripts/export_contracts.py`，再在前端目录运行 `npm run contracts:generate`；生成文件无需手工编辑。

常用检查命令：

```shell
# studio/backend
uv run ruff check src tests scripts
uv run pytest

# studio/frontend
npm run typecheck
npm test
npm run build
```

Studio 的持续集成配置见 [`check-studio.yml`](../.github/workflows/check-studio.yml)。
