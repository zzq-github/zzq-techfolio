# 周志强个人技术主页

一个用于展示 AI 应用、GIS 三维和全栈研发经验的个人作品网站。采用单页结构，兼顾桌面与手机浏览，支持本地开发和静态部署。

## 项目功能

- 展示个人介绍、技术能力、代表项目、工作经历、开源作品、个人产品和联系方式。
- 中英文切换，以及亮色、暗色、跟随系统三种外观；语言与主题偏好可在本机保存。
- 首页数字地球，配有暂停、重置及图形不可用时的静态后备展示。
- 五个交互式三维场景：土石方施工、桥梁巡检、海上风电、连通淹没分析、园区模型。
- 手机展开三维体验时，模型与参数面板分区显示；切换场景保留本次页面会话中的操作状态。
- 项目详情支持键盘操作、返回焦点及跳转到对应三维演示；重点案例区分个人职责、实现方案与交付内容。

三维场景和预览图均为本地合成演示，不代表客户项目实景、监测结果或工程计算结论。站点不提供 PDF 简历下载，也不包含简历附件。

## 技术栈

React 19、TypeScript、Vite 7、Tailwind CSS 4、Framer Motion、Three.js、Lucide React；使用 ESLint、Prettier 和 Playwright 进行代码与回归检查。

网站是纯前端静态应用，不需要后端服务或地图 API 密钥。项目经历中提及的 Cesium、SuperMap 等技术不等于本站集成了相应服务。

## 快速开始

环境要求：Node.js 22.13+、pnpm 11.22.0。CI 使用 Node.js 22.23.2，pnpm 版本固定在 [package.json](package.json) 中。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发地址：[http://127.0.0.1:5173/zzq-techfolio/](http://127.0.0.1:5173/zzq-techfolio/)。

生产构建与本地预览：

```bash
pnpm build
pnpm preview
```

构建产物位于 `dist/`，预览地址为 [http://127.0.0.1:4173/zzq-techfolio/](http://127.0.0.1:4173/zzq-techfolio/)。两种环境均使用 `/zzq-techfolio/` 子路径。

## 检查与测试

| 命令                | 用途                       |
| ------------------- | -------------------------- |
| `pnpm typecheck`    | TypeScript 类型检查        |
| `pnpm lint`         | ESLint 检查                |
| `pnpm format:check` | 文本格式检查               |
| `pnpm format`       | 格式化项目文件             |
| `pnpm test:e2e`     | 生产预览回归与场景计算测试 |

Windows 测试默认使用已安装的 Chrome；其他系统先安装 Chromium：

```bash
pnpm exec playwright install chromium
```

Linux CI 使用 `pnpm exec playwright install --with-deps chromium` 同时安装系统依赖。测试自动构建并启动独立的 5178 端口预览，无需提前运行开发服务器；失败截图和跟踪文件输出到 `tmp/test-results/`。

## 项目结构

```text
.github/workflows/       自动检查与 Pages 部署
docs/                   项目维护说明
public/                 随构建发布的静态资源
  data/                 地理数据及来源说明
  previews/             合成场景预览图
src/
  components/
    common/             项目弹窗、卡片等公共组件
    hero/               首屏与数字地球
    layout/             导航、偏好控件与页脚
    scenes/             三维实验室、渲染和场景模型
    sections/           内容区块
  config/               站点功能配置
  data/                 个人与项目内容
  hooks/                动效等公共逻辑
  i18n/                 英文翻译与内容转换
  preferences/          语言和主题状态
tests/                  浏览器回归与计算测试
```

## 内容维护

- 个人信息、项目、经历、开源作品与产品内容：[src/data/profile.ts](src/data/profile.ts)。
- 英文文案：[src/i18n/en.ts](src/i18n/en.ts)；修改中文内容时同步维护对应译文。
- 功能配置：[src/config/site.ts](src/config/site.ts)。
- 场景定义：[src/components/scenes/sceneData.ts](src/components/scenes/sceneData.ts)。
- 页面标题、默认描述与分享信息：[index.html](index.html)。

详细的样式、场景状态、资源与验证约定见 [项目维护说明](docs/项目维护说明.md)。

## 部署

仓库已公开，使用 `main` 作为发布分支，通过 [自动构建部署工作流](.github/workflows/deploy-pages.yml) 发布到 GitHub Pages。站点地址：[https://zzq-github.github.io/zzq-techfolio/](https://zzq-github.github.io/zzq-techfolio/)。每次更新是否已上线，以 Actions 中部署任务成功为准。

- 向 `main` 推送或在该分支手动运行工作流，会先检查和测试，再上传 `dist/` 并尝试部署。
- 面向 `main` 的 Pull Request 只执行检查，不部署。
- `dist/` 不提交到 Git，不需要单独的产物分支。
- 首次发布需要仓库满足 Pages 套餐条件，并在 Settings → Pages 中选择 GitHub Actions 作为 Source。私有仓库需要支持该能力的套餐，详见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

启用条件、工作流权限、路径迁移与故障排查见 [部署维护](docs/项目维护说明.md#部署维护)。

## 内容与资源边界

公开展示只使用适合发布的个人介绍和项目描述，不放入客户数据、内部系统地址、密钥或个人附件。所有 `public/` 文件都会随构建复制，加入前应检查内容。

地球陆地数据来自 Natural Earth，来源和使用条件见 [地理数据说明](public/data/README.md)。项目中的地形、建筑和巡检路线为程序化演示数据，不适用于实际测绘、巡检或工程决策。
