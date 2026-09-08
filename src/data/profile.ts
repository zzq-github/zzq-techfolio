export type Skill = {
  id: string
  number: string
  title: string
  subtitle: string
  description: string
  keywords: string[]
}

export type Project = {
  id: string
  index: string
  name: string
  type: string
  description: string
  highlights: string[]
  technologies: string[]
}

export type Experience = {
  period: string
  company: string
  role: string
  keywords: string[]
  summary: string
  metric?: string
}

export const profile = {
  name: '周志强',
  title: 'AI Application · GIS · Full Stack Developer',
  chineseTitle: 'AI 应用开发 · GIS 三维 · 全栈研发',
  headline: ['让智能落地。', '让空间可见。'],
  location: '长沙',
  locationCode: 'CHANGSHA · 28.2282° N, 112.9388° E',
  github: 'https://github.com/zzq-github',
  email: '15096061897@163.com',
  resumeUrl: '/resume.pdf',
  summary:
    '10 年软件研发经验，专注 AI Agent、GIS 三维可视化与全栈应用开发，持续探索 AI 与空间信息技术在真实业务中的工程化落地。',
  statement: 'Building intelligent applications between AI, GIS and the real world.',
  heroTags: ['10 Years Experience', 'AI Agent', 'Cesium', 'SuperMap', 'React / Vue', 'Java / Node.js'],
}

export const metrics = [
  { value: 10, suffix: '年+', label: '软件研发经验', detail: '从业务研发到技术架构与交付' },
  { value: 30, suffix: '+', label: '平台部署与支持', detail: '覆盖多区域实景三维与数字孪生项目' },
  { value: 'AI + GIS', suffix: '', label: '复合技术方向', detail: '智能应用 × 空间信息 × 全栈研发' },
  { value: 'Vue / React', suffix: '', label: '双前端技术栈', detail: '从组件工程到中大型业务系统' },
]

export const skills: Skill[] = [
  {
    id: 'ai',
    number: '01',
    title: 'AI Application & Agent',
    subtitle: 'AI 应用与 Agent',
    description:
      '熟练使用 ChatGPT、Codex Agent、DeepSeek 等 AI 工具，通过 Agent 辅助需求分析、方案设计、开发测试与持续迭代，并具备 AI 能力与真实业务系统集成实践。',
    keywords: ['ChatGPT', 'Codex Agent', 'DeepSeek', 'AI Workflow', 'LLM Integration', 'WebSocket Streaming'],
  },
  {
    id: 'gis',
    number: '02',
    title: 'GIS & 3D Visualization',
    subtitle: 'GIS 与三维可视化',
    description: '熟悉 SuperMap、Cesium 技术体系，具备 WebGIS、数字孪生、三维场景及多源空间数据处理能力。',
    keywords: ['Cesium', 'SuperMap', 'S3M', '3D Tiles', 'BIM', '倾斜摄影', '地形', '点云', 'Proj4'],
  },
  {
    id: 'frontend',
    number: '03',
    title: 'Frontend & Visualization',
    subtitle: '前端与可视化',
    description: '具备中大型 Web 应用、GIS 大屏、微前端、数据驾驶舱及多端应用开发经验。',
    keywords: ['JavaScript', 'TypeScript', 'Vue', 'Nuxt', 'React', 'Qiankun', 'ECharts', 'Vite'],
  },
  {
    id: 'backend',
    number: '04',
    title: 'Backend & Full Stack',
    subtitle: '后端与全栈',
    description: '具备 Java / Node.js 后端开发能力，能够完成接口设计、数据处理、前后端联调及系统集成。',
    keywords: ['Java', 'Spring Boot', 'Node.js', 'RESTful API', 'MySQL', 'PostgreSQL'],
  },
]

export const projects: Project[] = [
  {
    id: 'earthwork',
    index: '01',
    name: '土石方智慧控制调配系统',
    type: 'GIS / DIGITAL TWIN / SPATIAL DATA',
    description:
      '面向土石方施工调度与空间数据管理场景，基于 Cesium + SuperMap 构建三维 GIS 应用和多源空间数据处理体系。',
    highlights: [
      '构建 Cesium GIS 三维应用框架，接入 SuperMap iServer、S3M、3D Tiles 与 GeoJSON。',
      '实现影像披覆、模型管理、量测标绘和车辆运输态势模拟。',
      '处理坐标系识别转换、空间范围解析，以及填挖方、工程量和运输数据标准化。',
    ],
    technologies: ['Cesium', 'SuperMap iServer', 'S3M', '3D Tiles', 'GeoJSON', 'Proj4', 'ECharts'],
  },
  {
    id: 'uav',
    index: '02',
    name: '无人机桥梁智能巡检与三维可视化平台',
    type: 'UAV / GIS / 3D',
    description: '面向桥梁养护巡检的一体化业务与三维可视化平台，整合巡检任务、三维模型、病害复核与飞行报告。',
    highlights: [
      '覆盖项目建档、航线任务、三维模型、病害复核、工程量统计与飞行报告。',
      '实现 Cesium 图层管理、病害定位、标签量测及空间位置数据处理。',
      '完成 GIS 大屏与 Vue 3 后台系统整合。',
    ],
    technologies: ['Vue 3', 'TypeScript', 'Cesium', 'ECharts', 'Pinia', 'Axios'],
  },
  {
    id: 'scholardog',
    index: '03',
    name: 'ScholarDog AI 智能教学助手',
    type: 'AI APPLICATION / EDUCATION',
    description: 'ScholarDog 核心 AI 应用模块，覆盖 AI 问答、拍照解题、智能评分、写作助手和知识卡片。',
    highlights: [
      '负责 AI 教学工具模块架构及核心功能开发。',
      '设计 WebSocket 单例连接与发布订阅机制，实现流式响应、自动重连及连接保活。',
      '构建游客额度控制与图片上传、裁剪、预览、纠偏流程，支撑图像识别与试卷评分。',
    ],
    technologies: ['AI', 'WebSocket', 'Vue / Nuxt', 'Image Processing', 'MathJax'],
  },
  {
    id: 'offshore-wind',
    index: '04',
    name: '海上风电数据可视化平台',
    type: 'REACT / GIS / DATA VISUALIZATION',
    description: '面向海上风电规划与资产管理的数据驾驶舱和 GIS 可视化平台。',
    highlights: [
      '实现全国、省、市三级地图下钻，以及风电场、风机、升压站和海缆空间展示。',
      '支持卫星图、海图、风速图谱切换与 KML / KMZ、多坐标格式解析。',
      '串联地图展示、统计分析与资产管理的完整业务链路。',
    ],
    technologies: ['React', 'TypeScript', 'Cesium', 'ECharts', 'Ant Design'],
  },
  {
    id: 'water-twin',
    index: '05',
    name: '水利数字孪生可视化平台',
    type: 'DIGITAL TWIN / WATER / SUPERMAP',
    description: '基于 SuperMap 的水利数字孪生三维可视化与应急分析平台，为业务分析与辅助决策提供可视化支撑。',
    highlights: [
      '完成多源水利数据接入、目录管理与三维模型融合。',
      '模拟降雨、淹没、开闸放水、防洪调度等水利应急场景。',
      '支持溃坝分析、灾情评估及人员撤离场景展示。',
    ],
    technologies: ['SuperMap', 'Digital Twin', 'GIS', '3D Visualization'],
  },
  {
    id: 'micro-frontend',
    index: '06',
    name: '统一业务开放平台',
    type: 'MICRO FRONTEND / ARCHITECTURE',
    description: '面向轨道建设工程信息化的微前端管理平台，支撑多团队并行开发与独立部署。',
    highlights: [
      '基于 Vue + Qiankun 搭建主应用架构并沉淀子应用开发模板。',
      '完成基座与子应用通信、动态路由映射等核心能力。',
      '支持多项目并行研发与独立部署，提升系统可维护性和团队协作效率。',
    ],
    technologies: ['Vue', 'Qiankun', 'Element UI', 'Micro Frontend'],
  },
]

export const projectPresentation: Record<string, { label: string; stages: string[]; accent: string }> = {
  earthwork: { label: 'SPATIAL DATA', stages: ['多源数据', '三维场景', '施工调配'], accent: 'cyan' },
  uav: { label: 'INTELLIGENT INSPECTION', stages: ['航线任务', '病害定位', '巡检报告'], accent: 'blue' },
  scholardog: {
    label: 'AI FOR EDUCATION',
    stages: ['学习提问', 'AI 流式响应', '教学辅助'],
    accent: 'violet',
  },
  'offshore-wind': {
    label: 'ENERGY INTELLIGENCE',
    stages: ['空间资产', '统计分析', '资产管理'],
    accent: 'mint',
  },
  'water-twin': { label: 'DIGITAL TWIN', stages: ['水利数据', '场景模拟', '应急分析'], accent: 'blue' },
  'micro-frontend': {
    label: 'SYSTEM ARCHITECTURE',
    stages: ['应用基座', '子应用通信', '独立部署'],
    accent: 'amber',
  },
}

export const experiences: Experience[] = [
  {
    period: '2026.05 - 至今',
    company: '长沙勤一科技有限公司',
    role: '软件开发工程师',
    keywords: ['Cesium', 'SuperMap', 'Spatial Data', 'React', 'Vue'],
    summary:
      '负责 GIS 三维可视化、空间数据处理、数据驾驶舱及行业业务系统研发，参与土石方、无人机巡检、海上风电及新能源电力交易等项目。',
  },
  {
    period: '2024.03 - 2026.05',
    company: '长沙二三三网络科技有限公司',
    role: 'Web 前端综合开发',
    keywords: ['AI', 'Online Education', 'WebSocket', 'Nuxt', 'SEO'],
    summary:
      '参与 ScholarDog 海外智能教育平台与 AI 教学助手研发，覆盖 AI 问答、拍照解题、智能评分、在线作业及教学工具等核心能力。',
  },
  {
    period: '2022.03 - 2024.03',
    company: '北京超图软件股份有限公司',
    role: '软件开发工程师',
    keywords: ['SuperMap', 'Digital Twin', 'GIS', 'UAV', 'Java / Android'],
    summary:
      '参与实景三维中国、水利数字孪生、无人机巡检等项目研发，并承担全国区域技术交流、部署、培训和项目交付。',
    metric: '30+ 次平台部署与支持',
  },
  {
    period: '2019.05 - 2022.03',
    company: '深圳云建信筑星科技有限公司',
    role: 'Web 前端组长',
    keywords: ['Frontend Lead', 'Qiankun', 'BIM + GIS', 'WeChat Mini Program'],
    summary:
      '担任前端组长，负责微前端架构、BIM + GIS 工程平台及微信小程序研发，参与需求评审、任务拆分及多团队协作。',
  },
  {
    period: '2016.09 - 2019.05',
    company: '长沙卡友信息服务股份有限公司',
    role: 'JavaScript 开发工程师',
    keywords: ['SaaS', 'Finance', 'Business System'],
    summary: '参与农商行贷款管理系统、商圈会员 SaaS 及卡友信息管理平台研发。',
  },
]

export const openSourceProjects = [
  {
    name: 'React Admin Beautiful',
    code: 'RAB',
    description:
      '基于 React + TypeScript + Vite + Ant Design 的通用后台管理开源框架，提供动态路由、菜单与按钮权限、统一认证、Mock、CRUD、后端 Adapter、测试及 CI/CD。',
    tags: ['React', 'TypeScript', 'Vite', 'Ant Design', 'Open Source'],
    github: 'https://github.com/zzq-github/react-admin-beautiful',
    demo: 'https://zzq-github.github.io/react-admin-beautiful/',
  },
  {
    name: 'MathJax Beautiful',
    code: 'MATH',
    description:
      '基于 MathJax 开发并维护 Vue 3 / React 双版本数学公式组件库，支持 LaTeX 公式渲染、编辑和组件化集成，已完成 NPM 发布及持续版本维护。',
    tags: ['Vue 3', 'React', 'MathJax', 'NPM', 'Open Source'],
    github: 'https://github.com/zzq-github/mathjax-beautiful',
  },
]

export const product = {
  name: 'GIS 数据急救箱',
  subtitle: 'Commercial GIS Desktop Tool',
  status: 'IN DEVELOPMENT',
  description:
    '面向 GIS 数据交付中的坐标系错误、数据偏移、格式兼容等高频问题，独立设计并开发桌面诊断与修复工具。',
  features: [
    'CRS 识别',
    '坐标范围诊断',
    '中国常见坐标规则校验',
    'WGS84 转换',
    'Cesium 定位验证',
    'GDAL 数据处理',
    '诊断报告',
  ],
  flow: ['诊断', '转换', '复检', '交付'],
}

export const techStack = [
  { category: 'AI', items: ['ChatGPT', 'Codex Agent', 'DeepSeek', 'AI Workflow', 'WebSocket Streaming'] },
  {
    category: 'GIS',
    items: [
      'Cesium',
      'SuperMap',
      'iServer',
      'S3M',
      '3D Tiles',
      'BIM',
      'GeoJSON',
      'KML / KMZ',
      'Proj4',
      'GDAL',
    ],
  },
  {
    category: 'Frontend',
    items: [
      'JavaScript',
      'TypeScript',
      'Vue',
      'Nuxt',
      'React',
      'Vite',
      'Qiankun',
      'ECharts',
      'Ant Design',
      'Element Plus',
    ],
  },
  { category: 'Backend', items: ['Java', 'Spring Boot', 'Node.js', 'RESTful API', 'MySQL', 'PostgreSQL'] },
  {
    category: 'Engineering',
    items: [
      'Git',
      'Micro Frontend',
      'CI/CD',
      'GitHub Actions',
      'Mock',
      'Component Design',
      'System Integration',
    ],
  },
]

export const education = {
  school: '湖南工学院',
  degree: '软件工程 · 本科',
  period: '2012 - 2016',
}
