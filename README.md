# Iris Web

[Iris](https://github.com/Tsubaki-01/Iris) 的官网、文档网站与本地 Agent 工作台。

[访问官网](https://tsubaki-01.github.io/iris-web/) · [Iris 快速开始](https://tsubaki-01.github.io/iris-web/docs/getting-started/quickstart.html) · [启动 Iris Studio](studio/README.md)

本仓库包含两个独立应用：

| 应用 | 目录 | 用途 |
| --- | --- | --- |
| 官网与文档 | `site/` | 使用 VitePress 构建，通过 GitHub Pages 发布；文档来自 Iris 正式 Release |
| Iris Studio | `studio/` | 使用 React 前端与 Python 后端，在本地配置 Agent、运行任务并查看运行记录 |

以下命令均在仓库根目录执行，用于官网开发。工作台的安装与使用见 [Studio README](studio/README.md)。

## 本地运行官网

使用 [`.node-version`](.node-version) 指定的 Node 24，并将 Iris 源码仓库放在相邻目录：

```text
parent/
  Iris/
  iris-web/
```

安装依赖、导入文档并启动开发服务器：

```shell
npm ci
npm run content:prepare -- --source ../Iris
npm run dev
```

打开终端输出中的 `/iris-web/` 地址。`--source` 可以指向其他 Iris 工作区；源文档需包含 `docs/navigation.json`，以及快速开始中的 `iris-web` 首页代码标记。

修改 Iris 文档后，重新运行 `npm run content:prepare -- --source ../Iris` 即可更新本地预览。修改网站主题或页面时，开发服务器会自动更新。

构建并预览静态网站：

```shell
npm run build
npm run preview
```

## 维护内容与主题

文档正文统一在 Iris 仓库维护，本仓库负责网站展示和发布。

| 修改内容 | 维护位置 |
| --- | --- |
| 正文、图表、文档图片 | Iris 仓库的 `docs/` |
| 文档分组与排序 | Iris 仓库的 `docs/navigation.json` |
| 首页安装命令、最小 YAML、运行命令 | Iris 快速开始中的具名代码区域 |
| 首页布局与文档主题 | 本仓库的 `site/` |
| 文档导入与链接转换 | 本仓库的 `scripts/` 与 `site/.vitepress/` |

`site/docs/` 和 `site/.generated/` 由导入命令生成，请勿手工编辑或提交；再次导入会替换其中的内容。站内文档链接保留原有层级，源码与示例链接指向构建所用的 Iris 提交。

## 发布官网

官网通过 [部署工作流](.github/workflows/deploy-pages.yml) 发布到 GitHub Pages，以下事件会触发部署：

- `master` 分支上的网站工程或文档修订配置发生变更。
- 收到 Iris 的 `iris-release` 发版通知。
- 手动运行工作流。

每次部署读取 Iris 的 latest 正式 Release，以对应标签的内容构建首页和文档。若 [文档修订配置](.github/docs-revisions.json) 为该版本指定了提交，则使用修订提交并保留版本号。页面中的源码链接指向实际构建提交。

普通 Iris 文档合并不会更新线上版本；没有正式 Release 时跳过部署，构建失败时保留上一次成功发布的网站。

### 部署配置

在 iris-web 仓库的 Pages 设置中选择 **GitHub Actions**。在 Iris 仓库配置 `IRIS_WEB_DISPATCH_TOKEN`，使用可访问 iris-web 且具有 **Contents: write** 权限的 fine-grained PAT，供发版工作流发送通知。网站路径为 `/iris-web/`。

发版通知失败、预发布转为正式版本，或手动更换 latest 指向后，可以手动运行部署工作流更新网站。

### 同版本文档勘误

从对应 Release 标签创建修订分支，提交文档修正，再将版本号与修订提交的映射写入 [`.github/docs-revisions.json`](.github/docs-revisions.json)。该配置合并到 `master` 后会触发重新部署。

## 开发检查

导入文档后，运行内容测试与类型检查：

```shell
npm run test:content
npm run typecheck
```

浏览器测试使用静态构建：

```shell
npm run build
npx playwright install chromium
npm run test:browser
```

[网站检查工作流](.github/workflows/check-site.yml) 在网站相关 PR 中读取 Iris 的 `master` 分支，执行检查并保存预览产物。正式发布使用上面的部署工作流。
