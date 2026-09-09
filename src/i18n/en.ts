import { labCopy } from '../components/scenes/labCopy'
import { earthworkCopy } from '../components/scenes/modules/earthworkCopy'
import { waterCopy } from '../components/scenes/modules/waterCopy'
import { bridgeCopy } from '../components/scenes/modules/bridgeCopy'
import { campusCopy } from '../components/scenes/modules/campusCopy'

// Chinese is the source language. Brand names and technology identifiers stay unchanged.
export const en: Record<string, string> = {
  选择公式示例: 'Choose a formula example',
  积分: 'Integral',
  欧拉恒等式: 'Euler identity',
  '从零到一对 x 的平方积分等于三分之一': 'The integral of x squared from zero to one equals one third',
  'e 的 i π 次方加一等于零': 'e to the power of i pi plus one equals zero',
  '公式示例 · LaTeX': 'FORMULA EXAMPLES / LATEX',
  '本地开发 · 快速启动': 'LOCAL DEVELOPMENT / QUICK START',
  '打开{name}在线演示': 'Open the live demo of {name}',

  关联实践: 'RELATED WORK',
  业务场景: 'Business context',
  技术路径: 'Technical approach',
  在三维场景中探索: 'Explore the spatial concept',
  更多工程实践: 'More engineering work',
  '{name}概念三维场景预览': 'Conceptual 3D scene preview for {name}',
  '{name}演示页面预览': 'Demo page preview for {name}',
  演示页面截图: 'DEMO PAGE PREVIEW',
  复制邮箱: 'Copy email',
  已复制: 'Copied',
  '邮箱已复制，可以粘贴到邮件应用。': 'Email copied. Paste it into your email app.',
  '暂时无法复制，请选择邮箱地址手动复制，或点击发送邮件。':
    'Copy unavailable. Select the address to copy manually, or use Send an email.',
  恢复默认参数: 'Reset parameter',

  返回顶部: 'Back to top',
  查看源码: 'View GitHub',
  在线演示: 'Live demo',
  中国: 'China',
  语言与外观: 'Language and appearance',
  外观主题: 'Appearance',
  亮色: 'Light',
  暗色: 'Dark',
  跟随系统: 'System',
  体验三维模拟: 'Explore in 3D',
  查看项目详情: 'View project details',
  '体验{name}模拟三维场景': 'Explore the simulated 3D scene for {name}',
  '查看{name}详情': 'View details of {name}',
  '{name}演示参数': '{name} demo parameters',
  '产品流程：{steps}': 'Product workflow: {steps}',
  探索我的项目: 'Explore my work',
  '在新窗口打开 PDF 简历': 'Open the PDF resume in a new tab (Chinese)',
  下载简历: 'Resume (Chinese)',
  '在新窗口打开 GitHub': 'Open GitHub in a new tab',
  '，中国': ', China',
  '10 年工程经验': '10 years of engineering',
  从智能交互到业务集成: 'From AI interaction to business integration',
  让多源空间数据可见: 'Making spatial data visible',
  向下探索: 'Explore below',
  首页: 'Home',
  能力: 'Skills',
  项目: 'Projects',
  经历: 'Experience',
  开源: 'Open source',
  联系: 'Contact',
  跳转到正文: 'Skip to content',
  '周志强，返回首页': 'Zhou Zhiqiang, back to home',
  关闭导航菜单: 'Close navigation',
  打开导航菜单: 'Open navigation',
  主导航: 'Main navigation',
  聊聊合作: "Let's talk",
  土石方调配: 'Earthworks',
  '在起伏之间，规划工程。': 'Plan across the terrain.',
  '程序生成的山地地形、运输路径与车辆。调节地形夸张系数，观察高程层次与路线的空间关系。':
    'Procedural mountain terrain, haul routes and vehicles. Adjust vertical exaggeration to explore elevations and their relationship to the routes.',
  地形夸张: 'Terrain exaggeration',
  '青绿 · 高程网格': 'Mint · Elevation grid',
  '琥珀 · 运输线路': 'Amber · Haul routes',
  '白色 · 模拟车辆': 'White · Simulated vehicles',
  桥梁巡检: 'Bridge inspection',
  '沿着航线，发现细节。': 'Follow the route. Find the detail.',
  '参数化斜拉桥与无人机绕桥航线。移动扫描锥展示巡检方向，调节飞行速度观察巡检过程。':
    'A parametric cable-stayed bridge and a UAV inspection route. A moving scan cone shows the inspection direction; adjust flight speed to explore the process.',
  巡航速度: 'Cruising speed',
  '青绿 · 巡检航线': 'Mint · Inspection route',
  '蓝色 · 扫描范围': 'Blue · Scan coverage',
  '琥珀 · 示例复核点': 'Amber · Sample review points',
  海上风电: 'Offshore wind',
  '让海风，变得可见。': 'Make the sea breeze visible.',
  '九台参数化风机组成的海上风场。调节模拟风速，查看叶片转动变化与海缆连接关系。':
    'An offshore array of nine parametric turbines. Adjust simulated wind speed to observe blade rotation and subsea cable connections.',
  模拟风速: 'Simulated wind speed',
  '白色 · 风机阵列': 'White · Turbine array',
  '青绿 · 海缆连接': 'Mint · Subsea cables',
  '蓝色 · 程序化海面': 'Blue · Procedural sea',
  水利孪生: 'Water twin',
  '看见水位，也看见边界。': 'See the water. See the boundaries.',
  '合成河谷、拦水坝与水位平面。调节演示水位查看地形遮蔽变化，仅用于空间交互展示，不代表水文计算结果。':
    'A synthetic river valley, dam and water plane. Adjust the demonstration water level to see terrain coverage. This is a spatial interaction demo, not a hydrological calculation.',
  演示水位: 'Demo water level',
  '青绿 · 河谷地形': 'Mint · Valley terrain',
  '蓝色 · 水位平面': 'Blue · Water plane',
  '琥珀 · 示例观测点': 'Amber · Sample observation points',
  '概念场景 · 模拟数据': 'Concept scene · Simulated data',
  当前设备暂时无法显示三维场景: 'The 3D scene is unavailable on this device',
  正在准备三维场景: 'Preparing the 3D scene',
  '可继续浏览下方项目说明，或开启浏览器硬件加速后重试。':
    'You can still browse the project descriptions below, or enable browser hardware acceleration and try again.',
  '模型由本地参数生成，无需加载外部地图服务。':
    'Models are generated locally. No external map service is required.',
  重新加载: 'Try again',
  三维视角控制: '3D camera controls',
  向左旋转视角: 'Rotate camera left',
  向右旋转视角: 'Rotate camera right',
  放大三维场景: 'Zoom in',
  缩小三维场景: 'Zoom out',
  重置三维视角: 'Reset camera',
  播放动画: 'Play',
  暂停动画: 'Pause',
  退出拖动: 'Exit drag mode',
  拖动视角: 'Drag to orbit',
  '在场景内拖动旋转。退出拖动后，可正常滑动页面。':
    'Drag within the scene to orbit. Exit drag mode to scroll the page normally.',
  '点击「拖动视角」自由观察，或使用画面下方按钮。':
    'Enable “Drag to orbit” to explore, or use the camera buttons below the scene.',
  空间实验室: 'Spatial lab',
  '模拟演示 / 非项目实景': 'Simulation / Illustrative scene',
  选择模拟三维场景: 'Choose a simulated 3D scene',
  '所有模型、路线和参数均为本地合成，仅展示三维交互能力，不对应真实项目数据或运行状态。':
    'All models, routes and parameters are synthesized locally to demonstrate 3D interaction. They do not represent actual project data or operating conditions.',
  职业数据概览: 'Career at a glance',
  '有复杂问题？': 'A complex challenge?',
  '一起把它做成。': "Let's build it together.",
  '关注 AI 应用、三维 GIS、数据可视化及全栈业务系统的工程化落地。':
    'Focused on delivering AI applications, 3D GIS, data visualization and full-stack business systems.',
  发送邮件: 'Send an email',
  '十年，从交付走向架构。': 'A decade from delivery to architecture.',
  '持续在业务系统、前端架构、三维 GIS 与 AI 应用之间拓展工程边界。':
    'Expanding my engineering practice across business systems, frontend architecture, 3D GIS and AI applications.',
  '把工程经验沉淀为复用能力。': 'Engineering experience, made reusable.',
  '从高频问题出发，做一件趁手工具。': 'A practical tool for recurring problems.',
  '真实业务，真实构建。': 'Real problems. Working solutions.',
  '用技术回应具体问题。从空间数据到业务系统，从智能交互到工程交付。':
    'Solving concrete problems with technology, from spatial data and business systems to AI interaction and engineering delivery.',
  关闭项目详情: 'Close project details',
  核心工作: 'Key contributions',
  '跨越智能、空间与工程。': 'Across intelligence, space and engineering.',
  '以可落地的工程能力连接 AI 应用、三维 GIS 和完整业务系统。':
    'Connecting AI applications, 3D GIS and end-to-end business systems through practical engineering.',
  '技术不是清单，而是组合方式。': 'Tools matter. How they connect matters more.',
  周志强: 'Zhou Zhiqiang',
  'AI 应用开发 · GIS 三维 · 全栈研发': 'AI Applications · 3D GIS · Full Stack',
  '让智能落地。': 'Intelligence, applied.',
  '让空间可见。': 'Space, made visible.',
  长沙: 'Changsha',
  '10 年软件研发经验，专注 AI Agent、GIS 三维可视化与全栈应用开发，持续探索 AI 与空间信息技术在真实业务中的工程化落地。':
    '10 years in software engineering, focused on AI agents, 3D GIS and full-stack applications. Bringing AI and spatial technology into real business workflows.',
  '年+': '+ years',
  软件研发经验: 'Software engineering',
  从业务研发到技术架构与交付: 'From product development to architecture and delivery',
  平台部署与支持: 'Deployments & support',
  覆盖多区域实景三维与数字孪生项目: 'Supporting regional 3D mapping and digital twin projects',
  复合技术方向: 'Cross-domain expertise',
  '智能应用 × 空间信息 × 全栈研发': 'AI applications × Spatial information × Full stack',
  双前端技术栈: 'Two frontend ecosystems',
  从组件工程到中大型业务系统: 'From reusable components to large business systems',
  'AI 应用与 Agent': 'AI Applications & Agents',
  '熟练使用 ChatGPT、Codex Agent、DeepSeek 等 AI 工具，通过 Agent 辅助需求分析、方案设计、开发测试与持续迭代，并具备 AI 能力与真实业务系统集成实践。':
    'Use ChatGPT, Codex Agent and DeepSeek to support requirements analysis, solution design, development, testing and iteration, with hands-on experience integrating AI into business systems.',
  'GIS 与三维可视化': 'GIS & 3D Visualization',
  '熟悉 SuperMap、Cesium 技术体系，具备 WebGIS、数字孪生、三维场景及多源空间数据处理能力。':
    'Experienced with SuperMap and Cesium, including WebGIS, digital twins, 3D scenes and processing spatial data from multiple sources.',
  倾斜摄影: 'Oblique imagery',
  地形: 'Terrain',
  点云: 'Point clouds',
  前端与可视化: 'Frontend & Visualization',
  '具备中大型 Web 应用、GIS 大屏、微前端、数据驾驶舱及多端应用开发经验。':
    'Experience building large web applications, GIS displays, micro-frontends, dashboards and cross-platform applications.',
  后端与全栈: 'Backend & Full Stack',
  '具备 Java / Node.js 后端开发能力，能够完成接口设计、数据处理、前后端联调及系统集成。':
    'Develop Java and Node.js backends, covering API design, data processing, frontend-backend integration and system integration.',
  土石方智慧控制调配系统: 'Smart Earthworks Dispatch System',
  '面向土石方施工调度与空间数据管理场景，基于 Cesium + SuperMap 构建三维 GIS 应用和多源空间数据处理体系。':
    'A Cesium and SuperMap 3D GIS application with multi-source spatial data processing for earthworks scheduling and data management.',
  '构建 Cesium GIS 三维应用框架，接入 SuperMap iServer、S3M、3D Tiles 与 GeoJSON。':
    'Built the Cesium 3D GIS application framework and integrated SuperMap iServer, S3M, 3D Tiles and GeoJSON.',
  '实现影像披覆、模型管理、量测标绘和车辆运输态势模拟。':
    'Implemented imagery draping, model management, measurement, annotation and vehicle transport simulations.',
  '处理坐标系识别转换、空间范围解析，以及填挖方、工程量和运输数据标准化。':
    'Handled coordinate system identification and conversion, spatial extent parsing, and standardization of cut-and-fill, quantity and transport data.',
  无人机桥梁智能巡检与三维可视化平台: 'UAV Bridge Inspection & 3D Platform',
  '面向桥梁养护巡检的一体化业务与三维可视化平台，整合巡检任务、三维模型、病害复核与飞行报告。':
    'An integrated workflow and 3D visualization platform for bridge maintenance, connecting inspection tasks, models, defect review and flight reports.',
  '覆盖项目建档、航线任务、三维模型、病害复核、工程量统计与飞行报告。':
    'Covered project records, flight routes and tasks, 3D models, defect review, quantity statistics and flight reports.',
  '实现 Cesium 图层管理、病害定位、标签量测及空间位置数据处理。':
    'Implemented Cesium layer management, defect positioning, labels, measurements and spatial location data processing.',
  '完成 GIS 大屏与 Vue 3 后台系统整合。': 'Integrated the GIS display with the Vue 3 administration system.',
  'ScholarDog AI 智能教学助手': 'ScholarDog AI Teaching Assistant',
  'ScholarDog 核心 AI 应用模块，覆盖 AI 问答、拍照解题、智能评分、写作助手和知识卡片。':
    'Core ScholarDog AI tools for Q&A, photo-based problem solving, automated grading, writing assistance and knowledge cards.',
  '负责 AI 教学工具模块架构及核心功能开发。':
    'Owned module architecture and core development for the AI teaching tools.',
  '设计 WebSocket 单例连接与发布订阅机制，实现流式响应、自动重连及连接保活。':
    'Designed a singleton WebSocket connection and publish-subscribe messaging for streaming responses, automatic reconnection and keep-alive.',
  '构建游客额度控制与图片上传、裁剪、预览、纠偏流程，支撑图像识别与试卷评分。':
    'Built guest usage limits and image upload, crop, preview and correction workflows to support image recognition and exam grading.',
  海上风电数据可视化平台: 'Offshore Wind Visualization Platform',
  '面向海上风电规划与资产管理的数据驾驶舱和 GIS 可视化平台。':
    'A dashboard and GIS visualization platform for offshore wind planning and asset management.',
  '实现全国、省、市三级地图下钻，以及风电场、风机、升压站和海缆空间展示。':
    'Implemented national, provincial and city map drill-downs with spatial displays of wind farms, turbines, substations and subsea cables.',
  '支持卫星图、海图、风速图谱切换与 KML / KMZ、多坐标格式解析。':
    'Supported satellite, nautical and wind map layers, plus KML/KMZ and multiple coordinate formats.',
  '串联地图展示、统计分析与资产管理的完整业务链路。':
    'Connected map visualization, statistical analysis and asset management into a complete workflow.',
  水利数字孪生可视化平台: 'Water Digital Twin Platform',
  '基于 SuperMap 的水利数字孪生三维可视化与应急分析平台，为业务分析与辅助决策提供可视化支撑。':
    'A SuperMap-based water digital twin and emergency analysis platform, providing 3D visualization for operational analysis and decision support.',
  '完成多源水利数据接入、目录管理与三维模型融合。':
    'Integrated multi-source water data, catalog management and 3D models.',
  '模拟降雨、淹没、开闸放水、防洪调度等水利应急场景。':
    'Simulated water emergency scenarios including rainfall, inundation, gate releases and flood-control scheduling.',
  '支持溃坝分析、灾情评估及人员撤离场景展示。':
    'Supported scenario displays for dam-break analysis, disaster assessment and evacuation.',
  统一业务开放平台: 'Unified Business Platform',
  '面向轨道建设工程信息化的微前端管理平台，支撑多团队并行开发与独立部署。':
    'A micro-frontend management platform for rail construction systems, supporting parallel development and independent deployment across teams.',
  '基于 Vue + Qiankun 搭建主应用架构并沉淀子应用开发模板。':
    'Built the host application with Vue and Qiankun and created reusable sub-application templates.',
  '完成基座与子应用通信、动态路由映射等核心能力。':
    'Implemented host-to-sub-application communication and dynamic route mapping.',
  '支持多项目并行研发与独立部署，提升系统可维护性和团队协作效率。':
    'Enabled parallel development and independent deployment to improve maintainability and team collaboration.',
  多源数据: 'Source data',
  三维场景: '3D scenes',
  施工调配: 'Dispatch',
  航线任务: 'Flight tasks',
  病害定位: 'Defect location',
  巡检报告: 'Reports',
  学习提问: 'Questions',
  'AI 流式响应': 'AI streaming',
  教学辅助: 'Teaching tools',
  空间资产: 'Spatial assets',
  统计分析: 'Analytics',
  资产管理: 'Asset management',
  水利数据: 'Water data',
  场景模拟: 'Simulation',
  应急分析: 'Response analysis',
  应用基座: 'App shell',
  子应用通信: 'App messaging',
  独立部署: 'Deployment',
  '2026.05 - 至今': '2026.05 - Present',
  长沙勤一科技有限公司: 'Changsha Qinyi Technology Co., Ltd.',
  软件开发工程师: 'Software Engineer',
  '负责 GIS 三维可视化、空间数据处理、数据驾驶舱及行业业务系统研发，参与土石方、无人机巡检、海上风电及新能源电力交易等项目。':
    'Develop GIS visualization, spatial data processing, dashboards and industry systems for earthworks, UAV inspection, offshore wind and renewable energy trading projects.',
  长沙二三三网络科技有限公司: 'Changsha Ersansan Network Technology Co., Ltd.',
  'Web 前端综合开发': 'Web Frontend Developer',
  '参与 ScholarDog 海外智能教育平台与 AI 教学助手研发，覆盖 AI 问答、拍照解题、智能评分、在线作业及教学工具等核心能力。':
    'Developed the ScholarDog international education platform and AI teaching assistant, including AI Q&A, photo-based problem solving, grading, online assignments and teaching tools.',
  北京超图软件股份有限公司: 'SuperMap Software Co., Ltd.',
  '参与实景三维中国、水利数字孪生、无人机巡检等项目研发，并承担全国区域技术交流、部署、培训和项目交付。':
    'Contributed to 3D mapping, water digital twins and UAV inspection projects, with technical exchanges, deployment, training and delivery across regions in China.',
  '30+ 次平台部署与支持': '30+ platform deployments and support engagements',
  深圳云建信筑星科技有限公司: 'Shenzhen Yunjianxin Zhuxing Technology Co., Ltd.',
  'Web 前端组长': 'Frontend Team Lead',
  '担任前端组长，负责微前端架构、BIM + GIS 工程平台及微信小程序研发，参与需求评审、任务拆分及多团队协作。':
    'Led frontend development for micro-frontend architecture, BIM + GIS engineering platforms and WeChat mini programs, including requirements reviews, task planning and cross-team collaboration.',
  长沙卡友信息服务股份有限公司: 'Changsha Kayou Information Services Co., Ltd.',
  'JavaScript 开发工程师': 'JavaScript Developer',
  '参与农商行贷款管理系统、商圈会员 SaaS 及卡友信息管理平台研发。':
    'Developed loan management systems for rural commercial banks, retail membership SaaS and the Kayou information management platform.',
  '基于 React + TypeScript + Vite + Ant Design 的通用后台管理开源框架，提供动态路由、菜单与按钮权限、统一认证、Mock、CRUD、后端 Adapter、测试及 CI/CD。':
    'An open-source admin framework built with React, TypeScript, Vite and Ant Design, featuring dynamic routes, menu and button permissions, authentication, mocks, CRUD, backend adapters, testing and CI/CD.',
  '基于 MathJax 开发并维护 Vue 3 / React 双版本数学公式组件库，支持 LaTeX 公式渲染、编辑和组件化集成，已完成 NPM 发布及持续版本维护。':
    'Maintain Vue 3 and React math component libraries built on MathJax, supporting LaTeX rendering, editing and component integration, published on NPM with ongoing maintenance.',
  地球展示控制: 'Globe display controls',
  数字地球: 'DIGITAL EARTH',
  暂停地球动画: 'Pause globe animation',
  继续地球动画: 'Resume globe animation',
  重置地球视角: 'Reset globe view',
  'GIS 数据急救箱': 'GIS Data First Aid Kit',
  '面向 GIS 数据交付中的坐标系错误、数据偏移、格式兼容等高频问题，独立设计并开发桌面诊断与修复工具。':
    'An independently designed desktop diagnosis and repair tool for recurring GIS delivery issues such as incorrect coordinate systems, data offsets and format compatibility.',
  'CRS 识别': 'CRS identification',
  坐标范围诊断: 'Coordinate range checks',
  中国常见坐标规则校验: 'Chinese coordinate conventions',
  'WGS84 转换': 'WGS84 conversion',
  'Cesium 定位验证': 'Cesium position validation',
  'GDAL 数据处理': 'GDAL processing',
  诊断报告: 'Diagnostic reports',
  诊断: 'Diagnose',
  转换: 'Convert',
  复检: 'Recheck',
  交付: 'Deliver',
  湖南工学院: 'Hunan Institute of Technology',
  '软件工程 · 本科': "Software Engineering · Bachelor's degree",
  '周志强个人技术主页，10年软件研发经验，专注 AI Agent、GIS 三维可视化、Cesium、SuperMap、React、Vue 与全栈应用开发。':
    'Zhou Zhiqiang’s portfolio. 10 years of software engineering in AI agents, 3D GIS, Cesium, SuperMap, React, Vue and full-stack applications.',
  ...labCopy,
  ...earthworkCopy,
  ...waterCopy,
  ...bridgeCopy,
  ...campusCopy,
}
