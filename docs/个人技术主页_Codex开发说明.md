# 周志强个人技术主页 / 在线简历网站

## Codex 开发说明 V1.0

> 目标：基于现有简历内容，开发一个可托管在 GitHub Pages 的炫酷个人技术主页，用于求职与作品展示。
>
> 核心定位：**AI 应用开发 / GIS 三维开发 / 全栈开发 / 高级前端开发**
>
> GitHub 用户名：`zzq-github`
>
> 推荐仓库：`zzq-github.github.io`
>
> 推荐线上地址：`https://zzq-github.github.io`

---

# 1. 项目目标

开发一个面向招聘方、技术负责人和合作方的个人技术主页。

网站不是传统“PDF 简历网页化”，而是一个具有技术辨识度的个人作品主页，需要突出以下四个能力方向：

1. **AI 应用与 Agent 辅助研发**
2. **GIS / Cesium / SuperMap 三维可视化**
3. **React / Vue / Java / Node.js 全栈开发**
4. **10 年项目研发、架构、团队管理及交付经验**

网站需要做到：

- 第一屏 3~5 秒内建立个人技术标签；
- 突出 AI + GIS + Full Stack 的复合技术能力；
- 展示代表项目，而不是机械复制全部简历；
- 展示工作经历时间线；
- 展示开源项目及 GitHub 链接；
- 以网页展示个人经历和作品，不提供 PDF 简历下载；
- PC 和移动端均可正常浏览；
- 支持 GitHub Pages 静态部署；
- 页面视觉具有科技感、GIS 感和 AI 感，但不能过度炫技影响阅读。

---

# 2. 技术栈

推荐技术栈：

```text
React 18+
TypeScript
Vite
Tailwind CSS
Framer Motion
Three.js / @react-three/fiber（首页背景可选）
ECharts（少量数据展示可选）
Lucide React
```

状态管理原则：

- 当前网站以展示为主；
- 不强制引入 Redux；
- 如需全局主题、导航状态，使用 React Context 或 Zustand；
- 优先保持项目轻量。

---

# 3. GitHub Pages 部署要求

推荐仓库：

```text
zzq-github/zzq-github.github.io
```

默认分支：

```text
main
```

部署方式：

```text
GitHub Actions + GitHub Pages
```

要求提供：

```text
.github/workflows/deploy.yml
```

构建流程：

```bash
pnpm install
pnpm build
```

产物目录：

```text
dist
```

如果仓库名称为：

```text
zzq-github.github.io
```

则 Vite：

```ts
base: '/'
```

如果后续使用普通仓库，例如：

```text
resume-site
```

则配置：

```ts
base: '/resume-site/'
```

---

# 4. 网站整体风格

## 4.1 视觉定位

关键词：

```text
AI
GIS
Digital Twin
Developer
Dark Tech
Spatial Data
Agent
Engineering
```

整体风格：

- 深色科技主题；
- 黑灰 / 深蓝背景；
- 轻微网格、经纬线、粒子、扫描线效果；
- 强调色建议使用蓝青、青绿色、紫蓝渐变；
- 卡片采用半透明玻璃效果；
- 不要过量使用荧光；
- 保证中文正文可读性。

建议背景：

```text
#06080D
#0B1020
#101827
```

建议强调色：

```text
#00D4FF
#39E6C6
#7B61FF
```

原则：

> “炫酷”来自层级、动画和空间感，不来自大量高饱和颜色。

---

# 5. 页面结构

推荐单页滚动结构：

```text
/
├── Hero
├── About / Metrics
├── Core Skills
├── Featured Projects
├── Experience Timeline
├── Open Source
├── Tech Stack
├── Education
└── Contact
```

顶部固定导航：

```text
首页
能力
项目
经历
开源
联系
```

---

# 6. Hero 首页

## 6.1 主文案

姓名：

```text
周志强
```

英文 / 技术定位：

```text
AI Application · GIS · Full Stack Developer
```

中文定位：

```text
AI 应用开发 · GIS 三维 · 全栈研发
```

主描述建议：

```text
10 年软件研发经验，专注 AI Agent、GIS 三维可视化与全栈应用开发，
持续探索 AI 与空间信息技术在真实业务中的工程化落地。
```

动态英文标语：

```text
Building intelligent applications between AI, GIS and the real world.
```

可制作打字动画，但：

- 仅第一次进入播放；
- 播放完成后保持静态；
- 不要循环闪烁。

## 6.2 首屏标签

推荐展示：

```text
10 Years Experience
AI Agent
Cesium
SuperMap
React / Vue
Java / Node.js
```

## 6.3 CTA 按钮

主按钮：

```text
查看项目
```

另一个入口：

```text
GitHub
```

## 6.4 首页背景

优先方案：

### 方案 A：Three.js 地球

展示低面数 / 点云科技地球：

- 经纬线；
- 少量节点；
- 缓慢自转；
- 鼠标移动产生轻微视差；
- 禁止复杂 WebGL 特效。

### 方案 B：纯 CSS / Canvas

如果 Three.js 影响性能，使用：

- SVG 经纬网；
- 粒子网络；
- 扫描线；
- 网格背景。

移动端可自动关闭 Three.js，切换静态背景。

---

# 7. About / 数据概览

建议用 4 个数字卡片：

```text
10 年+
软件研发经验

30+
GIS / 数字孪生项目部署与支持

AI + GIS
复合技术方向

Vue / React
双前端技术栈
```

其中“30+”来自超图工作期间全国多区域实景三维 / 数字孪生项目部署经验。

数字卡片进入视口时做 Count Up 动画。

---

# 8. 核心技能

设计为 4 张主卡片。

## 8.1 AI 应用与 Agent

标题：

```text
AI Application & Agent
```

内容：

```text
熟练使用 ChatGPT、Codex Agent、DeepSeek 等 AI 工具，
能够通过 AI Agent 完成需求分析、技术方案、代码开发、
重构测试、问题排查和项目持续迭代，
具备 AI 能力与真实业务系统集成实践。
```

关键词：

```text
ChatGPT
Codex Agent
DeepSeek
AI Workflow
LLM Integration
WebSocket Streaming
```

视觉：

- 神经网络节点；
- Agent 工作流动画；
- 不要使用机器人卡通图标。

---

## 8.2 GIS 与三维

标题：

```text
GIS & 3D Visualization
```

内容：

```text
熟悉 SuperMap、Cesium 技术体系，
具备 WebGIS、数字孪生、三维场景及多源空间数据处理能力。
```

关键词：

```text
Cesium
SuperMap
S3M
3D Tiles
BIM
倾斜摄影
正射影像
地形
点云
Proj4
```

---

## 8.3 前端与可视化

标题：

```text
Frontend & Visualization
```

关键词：

```text
JavaScript
TypeScript
Vue
Nuxt
React
Qiankun
ECharts
Vite
```

描述：

```text
具备中大型 Web 应用、GIS 大屏、微前端、数据驾驶舱及多端应用开发经验。
```

---

## 8.4 后端与全栈

标题：

```text
Backend & Full Stack
```

关键词：

```text
Java
Spring Boot
Node.js
RESTful API
MySQL
PostgreSQL
```

描述：

```text
具备 Java / Node.js 后端开发能力，
能够完成接口设计、数据处理、前后端联调及系统集成。
```

---

# 9. Featured Projects 代表项目

不要展示全部项目。

首页重点展示 6 个。

推荐顺序：

```text
1. 土石方智慧控制调配系统
2. 无人机桥梁智能巡检与三维可视化平台
3. ScholarDog AI 智能教学助手
4. 海上风电数据可视化平台
5. 水利数字孪生可视化平台
6. 统一业务开放平台
```

PC：

```text
2 列 / 3 列卡片
```

Mobile：

```text
单列
```

每张项目卡片：

```text
项目名称
项目类型
一句话介绍
3~6 个技术标签
核心亮点
查看详情按钮
```

点击项目可：

- 打开 Modal；
- 或展开 Drawer；
- 不建议跳转到新页面，第一版保持单页。

---

# 10. 项目内容

## 10.1 土石方智慧控制调配系统

类型：

```text
GIS / Digital Twin / Spatial Data
```

简介：

```text
面向土石方施工调度与空间数据管理场景，
基于 Cesium + SuperMap 构建三维 GIS 应用和多源空间数据处理体系。
```

核心内容：

```text
- 构建 Cesium GIS 三维应用框架；
- 接入 SuperMap iServer、S3M、3D Tiles、GeoJSON；
- 处理正射影像、地形、工程边界等多源数据；
- 实现影像披覆、模型管理、量测标绘和车辆运输态势；
- 负责坐标系识别与转换、空间范围解析；
- 对填挖方、工程量、运输数据进行清洗、转换和标准化。
```

技术：

```text
Cesium
SuperMap iServer
S3M
3D Tiles
GeoJSON
Proj4
ECharts
```

---

## 10.2 无人机桥梁智能巡检与三维可视化平台

类型：

```text
UAV / GIS / 3D
```

简介：

```text
面向桥梁养护巡检的一体化业务与三维可视化平台。
```

核心内容：

```text
- 项目与桥梁建档；
- 无人机航线与飞行任务；
- 三维模型管理；
- 病害识别与复核；
- 工程量统计和飞行报告；
- Cesium 模型加载、图层管理、病害定位、量测标绘；
- UAV 航线、图片、模型及空间位置数据处理；
- GIS 大屏与 Vue 3 后台系统整合。
```

技术：

```text
Vue 3
TypeScript
Cesium
ECharts
Pinia
Axios
```

---

## 10.3 ScholarDog AI 智能教学助手

类型：

```text
AI Application / Education
```

简介：

```text
ScholarDog 核心 AI 应用模块，
覆盖 AI 问答、拍照解题、智能评分、写作助手和知识卡片。
```

核心内容：

```text
- 负责 AI 教学工具模块架构及核心开发；
- WebSocket 单例连接；
- 发布订阅消息机制；
- AI 流式响应；
- 自动重连及连接保活；
- 游客体验和 AI 使用额度控制；
- 图片上传、裁剪、预览、纠偏；
- 支撑 AI 图像识别和试卷智能评分。
```

技术：

```text
AI
WebSocket
Vue / Nuxt
Image Processing
MathJax
```

---

## 10.4 海上风电数据可视化平台

类型：

```text
React / GIS / Data Visualization
```

简介：

```text
面向海上风电规划与资产管理的数据驾驶舱和 GIS 可视化平台。
```

核心内容：

```text
- 全国、省、市三级地图下钻；
- 风电场、风机、升压站和海缆空间展示；
- 卫星图、海图、风速图谱切换；
- KML / KMZ 数据加载；
- 多坐标格式解析；
- 装机容量、建设状态和年度趋势分析；
- 地图展示—统计分析—资产管理完整业务链路。
```

技术：

```text
React
TypeScript
Cesium
ECharts
Ant Design
```

---

## 10.5 水利数字孪生可视化平台

类型：

```text
Digital Twin / Water / SuperMap
```

简介：

```text
基于 SuperMap 的水利数字孪生三维可视化与应急分析平台。
```

核心场景：

```text
降雨
淹没分析
开闸放水
防洪调度
溃坝分析
灾情评估
人员撤离
```

技术：

```text
SuperMap
Digital Twin
GIS
3D Visualization
```

---

## 10.6 统一业务开放平台

类型：

```text
Micro Frontend / Architecture
```

简介：

```text
面向轨道建设工程信息化的微前端管理平台。
```

核心内容：

```text
- Vue + Qiankun 微前端；
- 主应用架构搭建；
- 子应用开发模板；
- 基座与子应用通信；
- 动态路由映射；
- 支持多团队并行开发与独立部署。
```

技术：

```text
Vue
Qiankun
Element UI
Micro Frontend
```

---

# 11. 工作经历 Timeline

使用竖向时间轴。

桌面端：

```text
左侧时间
右侧公司 / 职位 / 项目
```

移动端：

```text
单列
```

时间顺序：

```text
2026.05 - 至今
长沙勤一科技有限公司
软件开发工程师

2024.03 - 2026.05
长沙二三三网络科技有限公司
Web 前端综合开发

2022.03 - 2024.03
北京超图软件股份有限公司
软件开发工程师

2019.05 - 2022.03
深圳云建信筑星科技有限公司
Web 前端组长

2016.09 - 2019.05
长沙卡友信息服务股份有限公司
JavaScript 开发工程师
```

每家公司只展示：

```text
职位
3~4 个关键词
1~2 句核心价值
```

不要全文复制简历项目。

---

# 12. 工作经历摘要内容

## 长沙勤一科技

关键词：

```text
Cesium
SuperMap
Spatial Data
React
Vue
Data Visualization
```

摘要：

```text
负责 GIS 三维可视化、空间数据处理、数据驾驶舱及行业业务系统研发，
参与土石方、无人机巡检、海上风电及新能源电力交易等项目。
```

---

## 长沙二三三网络科技

关键词：

```text
AI
Online Education
WebSocket
Nuxt
SEO
```

摘要：

```text
参与 ScholarDog 海外智能教育平台与 AI 教学助手研发，
覆盖 AI 问答、拍照解题、智能评分、在线作业及教学工具等核心能力。
```

---

## 北京超图

关键词：

```text
SuperMap
Digital Twin
GIS
UAV
Java / Android
```

摘要：

```text
参与实景三维中国、水利数字孪生、无人机巡检等项目研发，
并承担全国区域技术交流、部署、培训和项目交付。
```

突出数字：

```text
30+ 次平台部署与支持
```

---

## 深圳云建信

关键词：

```text
Frontend Lead
Qiankun
BIM + GIS
WeChat Mini Program
```

摘要：

```text
担任前端组长，负责微前端架构、BIM+GIS 工程平台及微信小程序研发，
参与需求评审、任务拆分及多团队协作。
```

---

## 长沙卡友

关键词：

```text
SaaS
Finance
Business System
```

摘要：

```text
参与农商行贷款管理系统、商圈会员 SaaS 及卡友信息管理平台研发。
```

---

# 13. Open Source 开源项目

开源项目独立一个 Section。

## 13.1 React Admin Beautiful

名称：

```text
React Admin Beautiful
```

描述：

```text
基于 React + TypeScript + Vite + Ant Design 的通用后台管理开源框架，
提供动态路由、菜单 / 按钮权限、统一认证、Mock、CRUD、
后端 Adapter、测试及 GitHub Pages CI/CD。
```

GitHub：

```text
https://github.com/zzq-github/react-admin-beautiful
```

Demo：

```text
https://zzq-github.github.io/react-admin-beautiful/
```

提供：

```text
View GitHub
Live Demo
```

按钮。

---

## 13.2 vue/react-mathjax-beautiful

名称：

```text
MathJax Beautiful
```

描述：

```text
基于 MathJax 开发并维护 Vue 3 / React 双版本数学公式组件库，
支持 LaTeX 公式渲染、编辑和组件化集成，
已完成 NPM 发布及持续版本维护。
```

UI 中突出：

```text
Vue 3
React
MathJax
NPM
Open Source
```

GitHub URL 请从实际仓库配置文件中读取，不要硬编码未知地址。

---

# 14. GIS 数据急救箱

这是个人商业化产品，不归入 Open Source。

单独设置：

```text
Side Project / Product
```

名称：

```text
GIS 数据急救箱
```

副标题：

```text
Commercial GIS Desktop Tool
```

描述：

```text
面向 GIS 数据交付中的坐标系错误、数据偏移、格式兼容等高频问题，
独立设计并开发桌面诊断与修复工具。
```

核心能力：

```text
CRS 识别
坐标范围诊断
中国常见坐标规则校验
WGS84 转换
Cesium 定位验证
GDAL 数据处理
诊断报告
```

产品流程：

```text
诊断 → 转换 → 复检 → 交付
```

状态显示：

```text
In Development / Commercial Product
```

不要标记为开源。

---

# 15. 技术栈 Tech Universe

建议做成动态标签云或轨道布局。

分类：

## AI

```text
ChatGPT
Codex Agent
DeepSeek
AI Workflow
WebSocket Streaming
```

## GIS

```text
Cesium
SuperMap
iServer
S3M
3D Tiles
BIM
GeoJSON
KML
KMZ
Proj4
GDAL
```

## Frontend

```text
JavaScript
TypeScript
Vue
Nuxt
React
Vite
Qiankun
ECharts
Ant Design
Element Plus
```

## Backend

```text
Java
Spring Boot
Node.js
RESTful API
MySQL
PostgreSQL
```

## Engineering

```text
Git
Micro Frontend
CI/CD
GitHub Actions
Mock
Component Design
System Integration
```

不要使用技能百分比：

```text
React 95%
Java 80%
```

这类表现方式不要出现。

---

# 16. 教育经历

```text
湖南工学院
软件工程 · 本科
2012 - 2016
```

保持简洁。

---

# 17. 联系方式

Contact 区域：

```text
周志强
长沙
Email
GitHub
```

GitHub：

```text
https://github.com/zzq-github
```

Email 可从配置文件读取。

重要：

```text
默认不要在网页正文直接公开手机号码。
```

因为 GitHub Pages 是公开互联网网站。

需要进一步联系方式时，由本人私下提供，不通过本站发布个人简历文件。

---

# 18. 简历文件与公开内容

当前站点不提供 PDF 简历查看或下载入口，工程与构建产物不包含 PDF 简历文件。

个人经历、能力和项目展示仍基于原有简历内容维护；简历作为内容来源，不作为站点公开附件。不要将个人简历文件放入公开资源目录。

---

# 19. 内容配置化

重要：

所有个人信息、项目、经历、技术栈不要散落在 React JSX 中。

统一放到：

```text
src/data/profile.ts
```

建议结构：

```ts
export const profile = {
  name: '周志强',
  title: 'AI Application · GIS · Full Stack Developer',
  location: '长沙',
  github: 'https://github.com/zzq-github',
  email: '',
}
```

工作经历：

```ts
export const experiences = []
```

项目：

```ts
export const projects = []
```

开源项目：

```ts
export const openSourceProjects = []
```

技术：

```ts
export const skills = []
```

以后改简历只改数据文件。

---

# 20. 推荐目录结构

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── hero/
│   │   ├── Hero.tsx
│   │   └── TechGlobe.tsx
│   │
│   ├── sections/
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Experience.tsx
│   │   ├── OpenSource.tsx
│   │   ├── TechStack.tsx
│   │   ├── Education.tsx
│   │   └── Contact.tsx
│   │
│   └── common/
│       ├── SectionTitle.tsx
│       ├── ProjectCard.tsx
│       ├── SkillCard.tsx
│       ├── TechTag.tsx
│       └── TimelineItem.tsx
│
├── data/
│   └── profile.ts
│
├── hooks/
│
├── styles/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# 21. 动画规范

使用 Framer Motion。

动画原则：

```text
克制
流畅
不影响阅读
```

推荐：

### Section

进入视口：

```text
opacity: 0 → 1
y: 30 → 0
```

### Project Card

Hover：

```text
translateY(-4px)
border glow
```

### Timeline

滚动进入时：

```text
节点点亮
线条逐步展开
```

### Skill

标签轻微 stagger。

### Hero

地球 / 粒子缓慢运动。

禁止：

```text
大量弹跳
页面整体缩放
高频闪烁
持续打字
持续旋转文字
过度 parallax
```

必须支持：

```css
@media (prefers-reduced-motion: reduce);
```

降低动画。

---

# 22. 响应式要求

断点：

```text
Mobile: < 768
Tablet: 768 - 1024
Desktop: > 1024
```

手机端：

- Hero 地球可隐藏；
- 项目卡单列；
- Timeline 单列；
- 技能卡单列 / 双列；
- 导航切换 Drawer；
- 禁止横向滚动；
- 字号最小 14px；
- 点击目标 >= 44px。

---

# 23. SEO

必须配置：

```html
<title>周志强 | AI Application · GIS · Full Stack Developer</title>
```

Description：

```text
周志强个人技术主页，10年软件研发经验，专注 AI Agent、
GIS 三维可视化、Cesium、SuperMap、React、Vue 与全栈应用开发。
```

Keywords：

```text
周志强
AI Application
AI Agent
Codex
GIS
Cesium
SuperMap
React
Vue
Full Stack
长沙
```

配置：

```text
Open Graph
Twitter Card
favicon
canonical
```

---

# 24. 性能要求

Lighthouse 目标：

```text
Performance >= 90
Accessibility >= 90
Best Practices >= 90
SEO >= 90
```

优化：

- Three.js 动态 import；
- 移动端禁用重 WebGL；
- 图片 WebP；
- lazy loading；
- 避免大型 UI 框架；
- route 不需要复杂拆分；
- 首屏 JS 尽量小。

---

# 25. Accessibility

必须：

- 所有按钮有 aria-label；
- Link 保持键盘可访问；
- 色彩对比度满足 WCAG；
- 不仅依靠颜色表达状态；
- 外链标明 target；
- 所有 icon 有可读辅助信息；
- Canvas / Three.js 提供 fallback。

---

# 26. 隐私要求

网站公开部署。

不要直接公开：

```text
身份证
家庭地址
手机
私人内部项目地址
公司内网地址
客户敏感数据
```

允许公开：

```text
姓名
工作经历
项目公开描述
GitHub
Email
长沙
公开 Demo
公开开源项目
```

---

# 27. 配置文件

创建：

```text
src/config/site.ts
```

```ts
export const siteConfig = {
  enableThreeGlobe: true,
  enableEmail: true,
  enablePhone: false,
  enableAnalytics: false,
}
```

后续可以关闭某些信息。

---

# 28. README

README 必须包含：

```text
项目介绍
技术栈
本地运行
构建
GitHub Pages 部署
如何修改简历数据
公开内容与个人简历文件边界
项目结构
```

运行：

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
```

---

# 29. 第一阶段实现范围

V1 必须完成：

- [ ] React + TypeScript + Vite 初始化
- [ ] Tailwind
- [ ] Dark Tech 视觉体系
- [ ] Hero
- [ ] 核心能力
- [ ] Featured Projects
- [ ] Experience Timeline
- [ ] Open Source
- [ ] GIS 数据急救箱
- [ ] Tech Stack
- [ ] Education
- [ ] Contact
- [ ] 不提供 PDF 简历下载入口，构建产物不包含个人简历文件
- [ ] Framer Motion
- [ ] 响应式
- [ ] SEO
- [ ] GitHub Actions
- [ ] GitHub Pages 部署
- [ ] README

---

# 30. 第二阶段增强项

V1 完成后再考虑：

- Three.js 动态 GIS 地球；
- 项目 Screenshot；
- 项目详情 Modal；
- GitHub API 获取 Star；
- GitHub Contribution 数据；
- 中英文切换；
- 日 / 夜主题；
- Web Analytics；
- 自定义域名；
- AI Chat Resume。

最后一项可作为未来特色：

```text
Ask My Resume
```

用户可以：

```text
“你有哪些 GIS 项目经验？”
“你做过哪些 AI 应用？”
“是否做过 Java？”
```

由 AI 基于简历数据回答。

该功能不属于 V1。

---

# 31. 验收标准

## 页面

- [ ] 首页视觉完成
- [ ] 导航锚点正确
- [ ] 所有 Section 完整
- [ ] 无内容溢出
- [ ] 无明显 CLS
- [ ] 手机可用

## 内容

- [ ] AI / GIS / 全栈定位第一屏明确
- [ ] 10 年经验展示明确
- [ ] 代表项目内容准确
- [ ] 工作经历时间准确
- [ ] 开源项目链接正确
- [ ] GIS 数据急救箱标记为商业产品而非开源
- [ ] 页面无 PDF 简历入口，公开资源中无个人简历文件

## 工程

- [ ] TypeScript 无 error
- [ ] ESLint 通过
- [ ] pnpm build 成功
- [ ] GitHub Actions 成功
- [ ] GitHub Pages 访问正常
- [ ] 页面刷新不 404

---

# 32. Codex 实施原则

请 Codex 严格遵循：

1. 先完成信息架构，再做动画；
2. 先完成静态可用版本，再增加 Three.js；
3. 不要为了炫酷牺牲性能；
4. 不要虚构工作成果或项目数据；
5. 不要新增简历没有出现过的技术能力；
6. 不要暴露电话号码；
7. 所有简历内容配置化；
8. 保证以后可以快速维护；
9. 每完成一个阶段运行 lint / typecheck / build；
10. 提交清晰的 Git commit。

---

# 33. 建议开发任务拆分

## M1：项目初始化

```text
React
TypeScript
Vite
Tailwind
ESLint
Prettier
```

验收：

```text
pnpm dev
pnpm build
```

---

## M2：基础 UI

完成：

```text
Header
Hero
Section
Footer
Dark Theme
Responsive
```

---

## M3：内容体系

完成：

```text
profile.ts
Skills
Projects
Experiences
Open Source
Product
Education
Contact
```

---

## M4：动画

完成：

```text
Framer Motion
Scroll Reveal
Timeline
Hover
Count Up
```

---

## M5：GIS 科技视觉

完成：

```text
Grid
Coordinate Line
Map/GIS Decoration
Three Globe
```

---

## M6：工程化

完成：

```text
SEO
Accessibility
Performance
GitHub Actions
GitHub Pages
README
```

---

# 34. 最终首页阅读顺序

招聘方应该在 30 秒内看到：

```text
周志强
↓
AI Application · GIS · Full Stack
↓
10 Years Experience
↓
核心技能
↓
土石方 / UAV / ScholarDog AI / 海上风电
↓
工作经历
↓
开源项目
↓
联系
```

最终效果应让访问者形成以下印象：

> “这是一名有长期工程经验，同时具备 AI Agent、GIS 三维和全栈研发能力的复合型工程师，而不是单一前端开发者。”

---

# 35. 开发启动 Prompt

完成项目初始化后，可直接继续给 Codex：

```text
请严格按照《个人技术主页_Codex开发说明.md》实施本项目。

首先阅读整个说明文档，不要立即堆砌页面代码。

执行顺序：
1. 分析需求和信息架构；
2. 输出当前项目实施计划；
3. 初始化 React + TypeScript + Vite 项目；
4. 建立 profile.ts 数据模型；
5. 实现 Dark Tech 基础设计系统；
6. 按 Hero → Skills → Projects → Experience → Open Source → Contact 顺序开发；
7. 完成响应式；
8. 再添加 Framer Motion；
9. 最后评估 Three.js 地球是否影响性能；
10. 配置 GitHub Pages 自动部署。

要求：
- 不虚构项目成果；
- 不暴露手机号；
- 保持 AI + GIS + Full Stack 的个人定位；
- 所有个人信息和项目内容数据化；
- 每个开发阶段执行 typecheck、lint 和 build；
- 出现问题直接定位并修复，不要留下 TODO；
- V1 完成后给出验收结果和后续优化建议。
```

---

# 36. 内容来源说明

本网站内容以最终版个人简历为基础。

简历核心定位：

```text
10 年工作经验
Agent 应用 / 全栈 / GIS / 前端
```

网站只是重新组织和视觉化简历内容。

禁止 Codex：

- 自行夸大工作成果；
- 修改工作时间；
- 修改公司名称；
- 编造项目访问地址；
- 编造项目客户；
- 编造 AI 模型研发经历；
- 把“AI Agent 辅助研发”包装成“大模型算法研发”。

---

**文档版本：V1.0**

**用途：Codex Agent 个人技术主页开发输入文档**
