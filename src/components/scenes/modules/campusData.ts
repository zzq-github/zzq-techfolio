import { METERS_PER_UNIT } from '../sceneTypes'

export interface CampusBuilding {
  id: string
  name: string
  use: string
  kind: 'office' | 'research' | 'factory' | 'service'
  x: number
  z: number
  width: number
  depth: number
  floors: number
  floorHeight: number
}

// A deliberately fictional campus. Dimensions use the same 1 unit = 10 m scale
// as the other analytical scenes; floor area excludes roof plant and canopies.
export const campusBuildings: readonly CampusBuilding[] = [
  {
    id: 'campus-a01',
    name: 'A01 · 创新总部',
    use: '总部办公',
    kind: 'office',
    x: -5.4,
    z: -4.25,
    width: 3.1,
    depth: 2.5,
    floors: 8,
    floorHeight: 0.42,
  },
  {
    id: 'campus-a02',
    name: 'A02 · 智算研发',
    use: '算法研发',
    kind: 'research',
    x: -1.05,
    z: -4.6,
    width: 3.15,
    depth: 2.6,
    floors: 6,
    floorHeight: 0.44,
  },
  {
    id: 'campus-a03',
    name: 'A03 · 联合实验室',
    use: '联合实验',
    kind: 'research',
    x: 4.3,
    z: -4.3,
    width: 4.0,
    depth: 2.8,
    floors: 4,
    floorHeight: 0.46,
  },
  {
    id: 'campus-b01',
    name: 'B01 · 智造工坊',
    use: '智能制造',
    kind: 'factory',
    x: 5.75,
    z: 0.2,
    width: 4.1,
    depth: 3.25,
    floors: 2,
    floorHeight: 0.62,
  },
  {
    id: 'campus-b02',
    name: 'B02 · 中试中心',
    use: '中试验证',
    kind: 'factory',
    x: 5.5,
    z: 4.5,
    width: 4.6,
    depth: 2.7,
    floors: 2,
    floorHeight: 0.6,
  },
  {
    id: 'campus-a04',
    name: 'A04 · 创业办公',
    use: '企业孵化',
    kind: 'office',
    x: -5.4,
    z: 4.0,
    width: 3.1,
    depth: 2.75,
    floors: 5,
    floorHeight: 0.42,
  },
  {
    id: 'campus-c01',
    name: 'C01 · 共享客厅',
    use: '公共服务',
    kind: 'service',
    x: -0.9,
    z: 5.1,
    width: 3.1,
    depth: 1.9,
    floors: 2,
    floorHeight: 0.48,
  },
  {
    id: 'campus-c02',
    name: 'C02 · 数据中心',
    use: '数据服务',
    kind: 'service',
    x: -6.2,
    z: 0.0,
    width: 2.25,
    depth: 2.3,
    floors: 3,
    floorHeight: 0.46,
  },
]

export function campusBuildingMeasures(building: CampusBuilding) {
  const footprint = building.width * building.depth * METERS_PER_UNIT ** 2
  return {
    footprint: Math.round(footprint),
    floorArea: Math.round(footprint * building.floors),
    height: Math.round(building.floors * building.floorHeight * METERS_PER_UNIT * 10) / 10,
  }
}

export const campusSiteArea = 22 * 18 * METERS_PER_UNIT ** 2
