# 周志强个人技术主页

面向招聘方、技术负责人和合作方的个人技术主页，突出 AI 应用、GIS 三维、全栈研发与长期工程交付经验。

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Three.js（按需加载的项目三维模拟）

## V2 视觉与交互

- 深色青绿主题、紧凑能力卡片、带业务流程的项目展示和玻璃质感导航。
- 首页使用 Natural Earth 真实陆地数据进行 Canvas 球面投影，展示点云、海岸线、经纬网与长沙位置。地理数据随项目本地提供。
- 滚动进度与导航选中状态联动，手机端保留地球视觉。
- 项目详情使用原生 dialog，支持 Escape、焦点圈定及关闭后回焦。
- 兼容系统减少动画设置；地球在不可见时暂停绘制。

## 项目三维空间实验室

- 在项目区体验土石方地形、无人机桥梁巡检、海上风电和水利河谷四个参数化场景；对应项目卡片可直接切换到该场景。
- 支持参数滑块、暂停/播放、旋转、缩放、重置视角，以及可开启/关闭的鼠标或触屏拖动。默认保留正常页面滚动，不劫持滚轮。
- 所有几何、路线和参数均为本地合成，页面明确标注模拟演示，不代表真实项目资产、监测数据或水文计算结果。没有外部地图请求、令牌或在线模型依赖。
- Three.js 动态分包，接近项目区时才加载。同一时间仅保留一个项目 WebGL 画布，离屏/后台暂停，最高 30 FPS、DPR 上限 1.5；切换场景释放几何、材质、事件和 WebGL 上下文。
- 当前三维独立分包约 150 KB gzip；Vite 会提示其压缩前体积超过 500 KB，但该分包不进入首屏加载路径。
- 系统开启“减少动态效果”时默认暂停；不支持 WebGL 2 或上下文丢失时显示说明和重试入口，其他项目内容仍可浏览。
- 场景参数：`src/components/scenes/sceneData.ts`；模型与渲染：`sceneEngine.ts`；交互组件：`SceneLab.tsx`；样式：`scenes.css`。

## 语言与主题

- 导航栏提供中文 / English 切换和亮色、暗色、跟随系统三种外观选项，桌面与手机均可使用。
- 首次访问默认中文、跟随系统。选择保存在本机浏览器中；刷新后恢复，并支持同源标签页间同步。浏览器禁用存储时仍可在当前访问中切换。
- 主题初始化脚本在 React 和样式加载前应用外观，避免已保存主题在首屏闪烁。选择“跟随系统”时实时响应系统配色变化，手动选择亮色或暗色时保持该选择。
- 地球与三维画布保留深色，外围面板、按钮和弹窗随页面主题变化。切换语言或主题不重建三维场景，也不重置演示参数。
- 英文模式覆盖简历内容、项目详情、三维提示与无障碍标签；页面语言、标题、描述及 Open Graph locale 同步更新。技术名称及装饰性英文标题保留原样。
- PDF 仍为现有中文版本，英文入口标注 `Resume (Chinese)`。这是一套页面的语言偏好切换，没有新增独立英文 URL 或英文 PDF。

维护入口：

- 中文简历：`src/data/profile.ts`；中文场景描述：`src/components/scenes/sceneData.ts`。
- 英文译文：`src/i18n/en.ts`，使用完整中文原文作为键；修改或增加中文内容时应同步更新对应译文。
- 组件文案：通过 `usePreferences().t()` 渲染；简历内容通过 `useContent()` 获取当前语言版本。
- 外观变量与适配：`src/themes.css`；偏好状态：`src/preferences/`；首屏初始化：`public/preferences.js`。

## 本地运行

环境要求：Node.js 20+、pnpm 9+。

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

测试先执行生产构建，再启动独立的 5178 端口预览，覆盖译文完整性、发布路径、双语弹窗、主题持久化、系统主题变化、首屏初始化、存储不可用、三维状态保留，以及 320 / 390 / 900 / 1280px 下的双语和明暗布局。报告位于忽略提交的 `tmp/test-results/`。Windows 默认使用已安装的 Chrome；其他系统先执行 `pnpm exec playwright install chromium`。

生产构建产物位于 `dist/`。

本地生产预览地址为 `http://127.0.0.1:4173/zzq-techfolio/`。

## 换行与格式规范

- 文本文件统一使用 UTF-8、LF 换行和两个空格缩进。
- `.gitattributes` 固定 Git 检出与提交时的文本换行，避免 Windows `core.autocrlf` 导致格式检查失败；PDF 按二进制处理。
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

## 替换 PDF 简历

用新的 PDF 文件覆盖：

```text
public/resume.pdf
```

页面中的“下载简历”按钮会在新窗口打开该文件。公开版本不应在页面正文展示手机号码。

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
- React 中的 PDF 简历与地理数据通过 `import.meta.env.BASE_URL` 拼接地址；新增运行时 `public/` 资源引用时也应遵循此约定。
- HTML 中的 favicon 和主题初始化脚本分别引用 `/favicon-3d.png`、`/preferences.js`，由 Vite 自动添加 `base` 前缀；这些资源属性不要再手工添加 `%BASE_URL%`，以免开发环境出现重复前缀。
- 3D Logo 原图为 `public/brand-logo-3d.png`；导航栏使用透明背景的 `brand-logo-3d-144.png`（约 32 KB），浏览器图标使用 `favicon-3d.png`（64 × 64，约 8 KB）。
- `index.html` 的 canonical 与 Open Graph URL 指向目标发布地址。
- 若迁移到用户主页仓库或自定义域名，需要同步调整 `vite.config.ts` 的 `base` 和 `index.html` 的 canonical、Open Graph URL。

当前仅完成发布路径适配，尚未配置 GitHub Actions / GitHub Pages 自动部署，也未进行线上发布。
