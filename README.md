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

## 本地运行

环境要求：Node.js 20+、pnpm 9+。

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://127.0.0.1:5173/`。

## 构建与检查

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm preview
```

生产构建产物位于 `dist/`。

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
│   └── sections/
├── config/
│   └── site.ts
├── data/
│   └── profile.ts
├── App.tsx
├── index.css
└── main.tsx
```

## 部署说明

当前阶段仅包含本地开发和静态构建，不包含 GitHub Pages 工作流。后续准备发布时，可根据仓库名称设置 Vite `base`，再增加 GitHub Actions 部署配置。
