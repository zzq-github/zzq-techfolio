# 周志强个人技术主页

面向招聘方、技术负责人和合作方的个人技术主页，突出 AI 应用、GIS 三维、全栈研发与长期工程交付经验。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Three.js（按需加载的数字地球与项目三维模拟）

## V2 视觉与交互

- 深色青绿主题、紧凑能力卡片、带业务流程的项目展示和玻璃质感导航。
- 首页使用 Natural Earth 陆地数据构建三维数字地球，展示受光球面、陆地点阵、海岸线、经纬网与长沙位置；静态 Canvas 球面投影作为后备。地理数据随项目本地提供。
- 滚动进度与导航选中状态联动，手机端保留地球视觉。
- 项目详情使用原生 dialog，支持 Escape、焦点圈定及关闭后回焦。
- 兼容系统减少动画设置；地球在不可见时暂停绘制。

## Spatial Engineering Studio 视觉优化

- 使用 v0 MCP 生成视觉方案后，按现有工程整合至 `src/refinement.css`，在基础样式与主题样式之后加载。
- 增加地球测绘网格与展示框，统一导航、卡片、流程图和章节编号的边线、圆角与间距；能力卡片技术标签底部对齐。
- 保留全部内容、双语与三种主题机制、三维渲染及发布路径；移动端继续显示原有 3D 品牌图标。
- 语言按钮保持固定宽度，主题选择不再给外层容器附加焦点强调，键盘操作仍有可见焦点。
- v0 方案记录：[Spatial engineering visual refinement](https://v0.app/chat/bFvlKzlIOjW)。该方案会话为私有，页面预览以本地实际工程为准。

## 项目三维空间实验室

- 在项目区体验土石方施工、桥梁病害巡检、海上风电、连通淹没分析和园区三维五个参数化场景；项目卡片与园区能力入口可直接切换场景。
- 土石方支持设计标高、挖填分区、原始地形叠加和施工进度。挖填方按 2.5 m 栅格的原始/设计高差积分；场景三轴统一为 1 单位 = 10 m。
- 桥梁支持逐站自动巡检和暂停下单步检查；四个预设病害通过距离、朝向及遮挡检查后发现，支持定位、筛选、复核和重置，不接入 AI 图像识别。
- 水利使用四邻域水源连通计算，支持低/高水位、26 m 坝顶阻隔与漫顶、分级水深、建筑受淹和隔离洼地。属于静态地形淹没演示，不计算流速、降雨或洪峰到达时间。
- 园区包含 8 栋程序化建筑及道路、停车、绿化和水景，支持建筑属性查询、独立图层、选中楼层剖切与日照时刻示意。明确标注为概念模型；未接入实景倾斜摄影资产、SuperMap SDK 或服务。
- 支持参数滑块、暂停/播放、旋转、缩放、重置视角，以及可开启/关闭的鼠标或触屏拖动。默认保留正常页面滚动，不劫持滚轮。
- 所有几何、路线和参数均为本地合成，页面明确标注模拟演示，不代表真实项目资产、监测数据或水文计算结果。没有外部地图请求、令牌或在线模型依赖。
- 实验室进入可视区时加载模型，与首页地球复用 Three.js 动态分包。同一时间仅保留一个项目 WebGL 画布，离屏/后台暂停绘制，参数指标仍可更新，最高 30 FPS、DPR 上限 1.5；切换场景释放几何、材质、事件和 WebGL 上下文。原生 dialog 展开、Escape 收起保留画布与操作状态。
- 共享 Three.js 分包约 142 KB gzip，启用首页地球时会在首屏渐进加载；Vite 仍会提示其压缩前体积超过 500 KB。文字、按钮和静态地球可先显示。
- 系统开启“减少动态效果”时默认暂停；不支持 WebGL 2 或上下文丢失时显示说明和重试入口，其他项目内容仍可浏览。
- 场景参数：`src/components/scenes/sceneData.ts`；共享渲染：`sceneEngine.ts`；独立模型与计算：`modules/`；交互组件：`SceneLab.tsx`；样式：`scenes.css` 和 `scenario.css`；各场景英文维护在 `*Copy.ts`。

### 手机交互与场景状态

- 手机点击“展开体验”后，上方模型保持可见，下方参数与对象列表独立滚动；控制面板可收起，横屏改为左右分区。播放、拖动开关和镜头按钮直接放在模型旁。
- 切换场景保留本次页面会话的参数、模式、图层、选中对象和巡检复核记录；“恢复默认参数”只重置当前场景。刷新页面恢复默认，不写入长期存储；桥梁从已检查点续行，不保存帧级飞行位置或自由镜头位置。
- 土石方的分析模式显示“设计完成面”，仅在过程推演模式显示施工进度；设计挖填总量不等同于当前已完成方量。
- 选中对象后聚焦详情；完成病害复核后保留“已复核”按钮和焦点。展开/收起不重建 WebGL 画布。

### 三个代表案例的个人贡献

- 土石方、ScholarDog、统一业务开放平台详情增加“我的职责 / 关键问题与实现 / 交付内容”，中英文同步。
- 内容来自已有开发说明和简历数据，不增加未经证实的业绩指标；本站合成演示不作为客户项目实景或交付验收材料。
- 通过 `Project.contribution` 可选字段维护，未配置的案例保持原有详情结构。

## 语言与主题

- 导航栏提供中文 / English 切换和亮色、暗色、跟随系统三种外观选项，桌面与手机均可使用。
- 首次访问默认中文、跟随系统。选择保存在本机浏览器中；刷新后恢复，并支持同源标签页间同步。浏览器禁用存储时仍可在当前访问中切换。
- 主题初始化脚本在 React 和样式加载前应用外观，避免已保存主题在首屏闪烁。选择“跟随系统”时实时响应系统配色变化，手动选择亮色或暗色时保持该选择。
- 地球与三维画布保留深色，外围面板、按钮和弹窗随页面主题变化。切换语言或主题不重建三维场景，也不重置演示参数。
- 英文模式覆盖简历内容、项目详情、三维提示与无障碍标签；页面语言、标题、描述及 Open Graph locale 同步更新。技术名称及装饰性英文标题保留原样。
- 这是一套页面的语言偏好切换，没有新增独立英文 URL；中英文页面均不提供 PDF 简历下载。

维护入口：

- 中文简历：`src/data/profile.ts`；中文场景描述：`src/components/scenes/sceneData.ts`。
- 英文译文：`src/i18n/en.ts`，使用完整中文原文作为键；修改或增加中文内容时应同步更新对应译文。
- 组件文案：通过 `usePreferences().t()` 渲染；简历内容通过 `useContent()` 获取当前语言版本。
- 外观变量与适配：`src/themes.css`；偏好状态：`src/preferences/`；首屏初始化：`public/preferences.js`。

## 本地运行

环境要求：Node.js 22.13+、pnpm 11.22.0。自动部署使用 Node.js 22.23.2；`package.json` 固定 pnpm 版本，确保本地与 CI 安装一致。

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://127.0.0.1:5173/zzq-techfolio/`，与生产环境使用相同的子路径。

## 构建与检查

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm preview
```

浏览器回归检查：

```bash
pnpm test:e2e
```

测试先执行生产构建，再启动独立的 5178 端口预览，覆盖译文完整性、发布路径、双语弹窗、主题持久化、系统主题变化、首屏初始化、存储不可用、三维状态保留，以及 320 / 390 / 900 / 1280px 下的双语和明暗布局。另覆盖米制挖填积分、坝体与水源连通边界、病害发现/复核、园区图层与剖切、施工播放、移动端离屏参数更新和图形上下文恢复。报告位于忽略提交的 `tmp/test-results/`，场景检查截图位于 `tmp/scenario-upgrade/`。Windows 默认使用已安装的 Chrome；其他系统先执行 `pnpm exec playwright install chromium`。

生产构建产物位于 `dist/`。

本地生产预览地址为 `http://127.0.0.1:4173/zzq-techfolio/`。

## 换行与格式规范

- 文本文件统一使用 UTF-8、LF 换行和两个空格缩进。
- `.gitattributes` 固定 Git 检出与提交时的文本换行，避免 Windows `core.autocrlf` 导致格式检查失败。
- `.editorconfig` 与 Prettier 的 `endOfLine: 'lf'` 保持一致。修改后执行 `pnpm format:check`，需要格式化时执行 `pnpm format`。

## 修改简历数据

个人信息、能力、项目、工作经历、开源项目、技术栈和教育经历统一维护在：

```text
src/data/profile.ts
```

功能开关维护在：

```text
src/config/site.ts
```

## 简历文件与公开内容

当前站点不提供 PDF 简历查看或下载入口，工程与构建产物不包含 PDF 简历文件。个人经历和项目内容仍通过数据文件维护；不要将个人简历文件放入公开资源目录。公开版本不应在页面正文展示手机号码。

## 项目结构

```text
src/
├── components/
│   ├── common/
│   ├── hero/
│   ├── layout/
│   ├── scenes/
│   └── sections/
├── config/
│   └── site.ts
├── data/
│   └── profile.ts
├── i18n/
├── preferences/
├── App.tsx
├── index.css
├── themes.css
└── main.tsx
```

## 部署说明

目标仓库为 `zzq-github/zzq-techfolio`，目标发布地址为 `https://zzq-github.github.io/zzq-techfolio/`。

- Vite `base` 统一设为 `/zzq-techfolio/`，本地开发、生产构建和预览均使用该路径。
- React 中的地理数据通过 `import.meta.env.BASE_URL` 拼接地址；新增运行时 `public/` 资源引用时也应遵循此约定。
- HTML 中的 favicon 和主题初始化脚本分别引用 `/favicon-3d.png`、`/preferences.js`，由 Vite 自动添加 `base` 前缀；这些资源属性不要再手工添加 `%BASE_URL%`，以免开发环境出现重复前缀。
- 3D Logo 原图为 `public/brand-logo-3d.png`；导航栏使用透明背景的 `brand-logo-3d-144.png`（约 32 KB），浏览器图标使用 `favicon-3d.png`（64 × 64，约 8 KB）。
- `index.html` 的 canonical 与 Open Graph URL 指向目标发布地址。
- 若迁移到用户主页仓库或自定义域名，需要同步调整 `vite.config.ts` 的 `base` 和 `index.html` 的 canonical、Open Graph URL。

### GitHub Pages 自动部署

- 发布分支为 `main`，工作流位于 `.github/workflows/deploy-pages.yml`。推送到 `main` 后自动执行，也可在 Actions 页面手动运行；面向 `main` 的 Pull Request 仅执行检查，不发布。
- 工作流使用锁文件安装依赖，执行 Lint、格式检查和 Playwright 浏览器回归。测试会先运行 TypeScript 检查与 Vite 生产构建，再启动预览验证；只有全部通过才上传 `dist/` 并部署。
- 部署仅使用 `dist/`，不上传源码、开发文档或测试报告；另有检查确保已移除的简历 PDF 不会进入发布产物。`dist/` 仍不提交到 Git，也不需要单独维护 `gh-pages` 产物分支。
- 首次启用时，在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。此设置需要仓库管理权限；工作流使用内置 `GITHUB_TOKEN`，无需额外配置个人令牌。
- Actions 中的 `Build and deploy GitHub Pages` 工作流显示部署成功后，即可访问上述站点地址；`github-pages` 环境记录每次部署对应的提交。失败时查看失败步骤日志，修复后重新推送或重新运行。
- Actions 均固定到具体提交，构建仅有源码只读权限；仅部署任务获得 Pages 写入与 OIDC 身份权限。更新 Action 版本时需同步校验并更新固定提交。
- 删除当前 PDF 不会自动移除 Git 历史里的旧文件；公开源码前仍需单独评估历史内容，不要把部署网站等同于清理仓库历史。

## 作品展示与交互维护

- `src/refinement.css` 负责首屏密度、能力双列布局、重点案例、开源预览和统一交互反馈，沿用 `themes.css` 的语义颜色。新增动效需兼容 `prefers-reduced-motion`。
- `public/previews/earthwork.webp` 与 `uav.webp` 来自本项目空间实验室的截图，合计约 43 KB；它们是本地合成场景，不是真实项目实景。替换时保持图片说明准确，并通过 `import.meta.env.BASE_URL` 引用。
- 开源区的 MathJax 公式示例用原生 MathML 展示两种固定公式，完整组件体验链接到 `https://zzq-github.github.io/mathjax-beautiful/`；React Admin 启动命令参考其[公开 README](https://github.com/zzq-github/react-admin-beautiful)。展示区不额外加载公式运行库。
- 案例弹窗使用原生 `dialog`，支持 Escape、背景点击、退出动画与焦点返回。进入三维模拟后，焦点移动到对应实验室。复制邮箱失败时保留可选择的邮箱与邮件链接。
- `pnpm test:e2e` 覆盖双语、主题、响应式、发布路径，以及邮箱复制、弹窗跳转、参数与视角独立复位、预览图片、公式切换和地球渲染生命周期。

## 数字地球与页面氛围

- `src/components/hero/globeEngine.ts` 使用与实验室共享的 Three.js 分包，按可见区域加载。实体球面、大气边缘、陆地点阵和轮廓均基于本地地理数据；轨道仅为装饰，不代表业务覆盖或实时数据。
- 地球提供暂停和重置按钮；离屏、页面隐藏或开启减少动态效果时停止动画。移动端降低像素比、球面细分和点阵数量，不拦截触摸滚动。
- 加载前或 WebGL 不可用时显示 `GlobeFallback.tsx` 的静态 Canvas 地球。地理数据请求失败仍保留三维球体和经纬线；`enableThreeGlobe` 可关闭三维增强。
- `src/atmosphere.css` 负责分区柔光、地形等高线和背景网格；`public/atmosphere/terrain.svg` 是程序生成的装饰性等高线，不是真实地形数据。背景不接收指针事件，亮暗主题分别使用颜色与强度变量。
