# Iris Studio

Iris 的本地 Agent 工作台。中央保持真实聊天，左侧切换观察入口，右侧读取当前运行或共享资源的实际状态。首次启动为空工作区；导入自己的 Agent YAML 后才能执行任务。

官网仍由仓库根的 VitePress 工程构建。Studio 的前端与 Python 宿主独立位于本目录，运行时依赖相邻的 Iris 源码仓库。

## 安装与启动

需要 Node 24、Python 3.12+ 和 uv。目录应为：

```text
parent/
  Iris/
  iris-web/
    studio/
      backend/
      frontend/
```

当前集成基线为 Iris `c8a2185ba96753f0ff5a0dbb3eaeae0264ef78fe`，包含生成作业排空修复。相邻 Iris checkout 应包含此提交；安装的是这个源码项目，不是公共包仓库里的同名包。

在 `studio/backend` 安装后端依赖并导出契约：

```shell
uv sync --locked
uv run python scripts/export_contracts.py
```

在 `studio/frontend` 构建前端：

```shell
npm ci
npm run contracts:generate
npm run build
```

回到 `studio/backend`，启动工作台：

```shell
uv run iris-studio --env-file ../../../Iris/.env
```

打开 `http://127.0.0.1:8000`。前端构建文件和 API 由同一进程提供，不需要 Vite 开发服务器。已经在终端设置 Iris 凭据时可省略 `--env-file`；默认不会自动读取 `.env`。

`--port` 修改监听端口，`--data-dir` 修改工作台资料目录，默认是启动目录中的 `.iris-studio`。保持单个后端进程管理同一组工作区；浏览器关闭不取消已提交任务，关闭后端会按 Iris 的规则收口。这里的本地运行不等于模型离线，模型和联网工具仍使用所配置的服务。

## 完成第一个任务

1. 选择 **Agent 配置**，登记本地工作区，导入已有 `agent.yaml`。相对引用始终以原配置文件为基准。
2. 在九个配置分组或完整 YAML 中编辑，点击 **校验声明**。有改动时先 **保存文件**，再 **采用为新实例**。
3. 新建会话并输入实际任务。中央显示模型内容、工具调用和人工问题，右栏随运行数据更新。
4. 左侧切换上下文、工具与委派、配置或模型调用，中央聊天、草稿和会话身份保持不变。

例如使用已配置凭据的 provider，在一个有 `input.txt` 的目录保存：

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

输入“读取 input.txt，总结其中的内容；有需要我决定的地方请先询问”。成功依据是本次真实工具、回答和运行状态，回答正文不要求与固定示例相同。更多 YAML 规则由 [Iris 配置参考](https://github.com/Tsubaki-01/Iris/blob/f45369846b1513d300ab182ab6aa8733b4a726a3/docs/reference/configuration.md) 维护。

## 控制与历史

- **补充当前任务**与**下一轮处理**走不同输入模式；排队项显示实际去向。中断要等待 Iris 完成收尾，HTTP 接受回执不是终态。
- 人工问题使用问题卡回答，工具权限使用对应决定。不能把普通聊天输入当作 HITL 回答。
- 刷新页面重新同步当前会话，不重发输入。后端重启后，进程内排队状态不会被伪装成已恢复。
- 历史先按只读方式打开。没有未完成运行时选择配置继续会话；有未完成运行时显式恢复。选择其他配置不会把原运行切到另一个数据库。
- 配置保存不热改旧实例。共享资源策略或维护协调器参数冲突会列出占用实例；显式退役后再采用新配置。仍有待回答或待收尾任务时会显示阻塞原因。

## 观察实际能力

上下文面板读取本次准备过程、实际计量和来源。完整模型调用要等该次调用的 span 结束后才可读取；没有开启内容采集、内容被截断或记录缺失时会明确显示，不用当前文件重建旧请求。

Memory、Evolution、Goal/Todo 和语音需要在 Agent 配置中启用。新的自动记忆/经验原文批次同时受空闲时间与合格新 Run 数量约束，默认数量是 10；“等待材料”不是失败。立即整理仍遵守前台占用和领域资格。

Evolution 的完整发布详情按 Iris 的保留规则过期，旧摘要仍可查询；发布成功、发布确认和后续运行实际采用分别呈现。Todo 编辑的是当前 Markdown 文件，目标暂停只停止后继推进，不代替中断当前 Run。

图片由 Iris 保存原图和模型副本；工具产物来自发布时副本。语音输入需要相应 ASR 配置和专属凭据，最终转录先进入草稿，不自动发送聊天。

## 保存面试展示记录

从 **记录与导出**选择真实运行及要带走的产物。导出包包含捕获范围、缺失说明、机器可读 JSON、图片与只读页面；解压后直接打开 `index.html`，不需要服务或联网。

只读包不会继续任务、恢复交互或执行配置。未选择的产物、未采集的请求和已过期详情不会被补造。要保留完整发布详情，应在其仍可读取时明确选中导出。

## 开发和验证

后端在 `studio/backend` 运行 `uv run iris-studio`；前端在 `studio/frontend` 运行 `npm run dev`，默认 `5174` 代理后端 `8000`。官网根目录的 `npm run dev/build` 仍只服务官网。

HTTP 路由和明确消费的 SSE payload 是唯一类型来源。修改协议后先运行后端 `scripts/export_contracts.py`，再运行前端 `npm run contracts:generate`；不要手改生成文件。

```shell
# studio/backend
uv run ruff check src tests scripts
uv run pytest

# studio/frontend
npm run typecheck
npm test
npm run build
```

后端测试用真实 Iris SDK 配合受控 provider，前端测试覆盖消息同步、协议和交互；这些结果与真实外部模型、ASR、浏览器视觉验收分开记录。独立的 `check-studio.yml` 检查本目录，不替换官网发布工作流。GitHub Pages 只能承载静态官网或只读包，不能运行这个 Python 宿主。
