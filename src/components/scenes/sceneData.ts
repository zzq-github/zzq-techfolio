export const sceneDefinitions = {
  earthwork: {
    name: '土石方调配',
    code: '01 / TERRAIN',
    title: '在起伏之间，规划工程。',
    description: '程序生成的山地地形、运输路径与车辆。调节地形夸张系数，观察高程层次与路线的空间关系。',
    parameter: '地形夸张',
    min: 50,
    max: 180,
    initial: 100,
    unit: '%',
    legend: ['青绿 · 高程网格', '琥珀 · 运输线路', '白色 · 模拟车辆'],
  },
  uav: {
    name: '桥梁巡检',
    code: '02 / INSPECTION',
    title: '沿着航线，发现细节。',
    description: '参数化斜拉桥与无人机绕桥航线。移动扫描锥展示巡检方向，调节飞行速度观察巡检过程。',
    parameter: '巡航速度',
    min: 20,
    max: 150,
    initial: 65,
    unit: '%',
    legend: ['青绿 · 巡检航线', '蓝色 · 扫描范围', '琥珀 · 示例复核点'],
  },
  'offshore-wind': {
    name: '海上风电',
    code: '03 / OFFSHORE',
    title: '让海风，变得可见。',
    description: '九台参数化风机组成的海上风场。调节模拟风速，查看叶片转动变化与海缆连接关系。',
    parameter: '模拟风速',
    min: 0,
    max: 20,
    initial: 8,
    unit: 'm/s',
    legend: ['白色 · 风机阵列', '青绿 · 海缆连接', '蓝色 · 程序化海面'],
  },
  'water-twin': {
    name: '水利孪生',
    code: '04 / HYDROLOGY',
    title: '看见水位，也看见边界。',
    description:
      '合成河谷、拦水坝与水位平面。调节演示水位查看地形遮蔽变化，仅用于空间交互展示，不代表水文计算结果。',
    parameter: '演示水位',
    min: 10,
    max: 90,
    initial: 35,
    unit: '%',
    legend: ['青绿 · 河谷地形', '蓝色 · 水位平面', '琥珀 · 示例观测点'],
  },
} as const

export type SceneKind = keyof typeof sceneDefinitions
export function isSceneKind(value: string): value is SceneKind {
  return Object.hasOwn(sceneDefinitions, value)
}
