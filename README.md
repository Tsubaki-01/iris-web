# Iris 官网与文档网站

VitePress 网站工程位于 `site/`，首页沿用 Iris 的植物学视觉设计，文档直接读取 [Iris](https://github.com/Tsubaki-01/Iris) 仓库中的 Markdown。正式站点通过 GitHub Pages 发布，正文对应 GitHub latest 正式 Release。

## 本地开发

使用 `.node-version` 指定的 Node 24。将 Iris 仓库放在相邻目录，其文档需要包含 `docs/navigation.json` 和快速开始中的首页代码标记。

```shell
npm ci
npm run content:prepare -- --source ../Iris
npm run dev
```

打开命令输出中的 `/iris-web/` 地址。开发预览包含指定 Iris 工作区的文档修改；改正文后再次运行 `content:prepare`，开发服务器会采用更新后的生成文件。

```shell
npm run content:prepare -- --source ../Iris
npm run test:content
npm run typecheck
npm run build
npm run preview
```

浏览器验收使用静态构建：

```shell
npx playwright install chromium
npm run test:browser
```

截图保存在 `output/playwright/`。修改链接或导入脚本时运行内容测试；修改页面交互时运行相关浏览器用例。普通文字或样式小改不要求运行所有测试。

## 内容与主题的边界

- 正文、图表与文档图片在 Iris/docs 维护；分组与排序在同仓库的 `navigation.json` 维护。
- 首页的安装、最小 YAML 和运行命令从快速开始中的具名区域提取。
- 主题、首页表现、源码链接转换和构建流程在本仓库维护。
- `site/docs/` 与 `site/.generated/` 是构建输入，不能人工编辑或提交；再次导入会替换旧内容。
- 站内链接保留文档层级；指向源码、测试或 examples 的链接转到同版 GitHub 提交。页面显示发布版本或“开发预览”。

## 发布

`check-site.yml` 对网站 PR 使用 Iris/master 生成开发预览并检查主要流程，不部署。

`deploy-pages.yml` 在网站 master 的工程变更、Iris 发版通知或手动运行时，解析 latest 正式 Release，检出该标签并固定提交，构建后发布 Pages。无正式 Release 时明确跳过部署，普通 Iris 文档合并不会更新线上版本。

首次上线需要：

1. 将 Iris 导航与文档接入改动合并到维护分支，并为首个真实 Release 固定安装标签。
2. 将网站工程推送到公开的 iris-web 仓库，在 Pages 中选择 GitHub Actions。
3. 在 Iris 配置 `IRIS_WEB_DISPATCH_TOKEN`，使用可访问 iris-web 且具备 Contents write 的 fine-grained PAT；Iris 的发版工作流用它发送通知。
4. 发布正式 Release 并设为 latest，检查 Actions 与线上页面。项目路径为 `/iris-web/`，实际地址以 Pages 返回值为准。

构建失败时线上保持上一个成功版本。通知或发布失败可重跑；预发布转正式、手动更换 latest 指向后，可手动运行部署工作流。首页样式更新仍使用正式版本正文。

## 本地设计工作台

根 `index.html` 和 `output/` 保留为本地设计资料，不进入网站构建与公开提交。原始工作台说明保存在本地 `output/design-workbench-readme.md`，从根目录 `index.html` 打开图库。
