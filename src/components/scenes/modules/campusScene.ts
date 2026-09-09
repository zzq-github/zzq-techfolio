import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { baseTile, box, line, material, mesh, palette, v } from '../sceneKit'
import type { PublishScene, SceneModule, SceneOptions, SceneSnapshot } from '../sceneTypes'
import { campusBuildingMeasures, campusBuildings, campusSiteArea, type CampusBuilding } from './campusData'

interface BuildingView {
  data: CampusBuilding
  group: THREE.Group
  shell: THREE.MeshStandardMaterial
  edges: THREE.LineBasicMaterial
  clippedMaterials: THREE.Material[]
  clip: THREE.Plane
  floors: THREE.Group
  halo: THREE.Line
  pin: THREE.Group
  shadow: THREE.Mesh
}

const messages = {
  overview: '概念园区 · 1 单位 = 10 米。建筑属性来自模型几何；未加载实景倾斜摄影或 SuperMap 服务。',
  analysis: '选择建筑查看几何属性；开启剖切可观察楼板。光照与投影用于时刻示意，不代表真实日照分析。',
  process: '沿园区道路漫游，观察建筑与景观的空间关系。车辆为演示动画，不代表实时运营数据。',
} as const

function convexHull(points: THREE.Vector2[]) {
  const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const lower: THREE.Vector2[] = []
  const upper: THREE.Vector2[] = []
  for (const p of sorted) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  for (const p of sorted.slice().reverse()) {
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

// Combine static details by material so windows, trees and parked cars do not
// each require a draw call. Dynamic objects and clipping groups stay separate.
function compactMeshes(parent: THREE.Group, recursive = false) {
  parent.updateWorldMatrix(true, true)
  const inverse = parent.matrixWorld.clone().invert()
  const source: THREE.Mesh[] = []
  const collect = (object: THREE.Object3D) => {
    if (object instanceof THREE.Mesh && !Array.isArray(object.material)) source.push(object)
  }
  if (recursive) parent.traverse(collect)
  else parent.children.forEach(collect)
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const originals = new Set<THREE.BufferGeometry>()
  for (const object of source) {
    const mat = object.material as THREE.Material
    const geometry = object.geometry.clone()
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld))
    const batch = batches.get(mat) ?? []
    batch.push(geometry)
    batches.set(mat, batch)
    originals.add(object.geometry)
    object.removeFromParent()
  }
  const result: THREE.Mesh[] = []
  for (const [mat, geometries] of batches) {
    const merged = mergeGeometries(geometries)
    if (merged) result.push(mesh(parent, merged, mat))
    geometries.forEach((geometry) => geometry.dispose())
  }
  originals.forEach((geometry) => geometry.dispose())
  return result
}

export function createCampusScene(publish: PublishScene): SceneModule {
  const root = new THREE.Group()
  root.name = 'concept-campus'
  baseTile(root)
  const buildings = new THREE.Group()
  const roads = new THREE.Group()
  const greenery = new THREE.Group()
  const shadows = new THREE.Group()
  root.add(buildings, roads, greenery, shadows)
  const pickables: THREE.Object3D[] = []
  const views: BuildingView[] = []
  const paving = material(0x2c4147)
  const concrete = material(0x91a4a0)
  const asphalt = material(0x152b35)
  const curb = material(0x476065)
  const ground = material(0x273e42)
  const grass = material(0x345f54)
  const bark = material(0x665849)
  const leaf = material(0x608d6f)
  const darkLeaf = material(0x366e60)
  const roadMark = new THREE.MeshBasicMaterial({ color: 0x90b7b3 })
  const signal = new THREE.MeshBasicMaterial({ color: palette.mint })
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x041a21,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide,
    clippingPlanes: [
      new THREE.Plane(v(1, 0, 0), 11),
      new THREE.Plane(v(-1, 0, 0), 11),
      new THREE.Plane(v(0, 0, 1), 9),
      new THREE.Plane(v(0, 0, -1), 9),
    ],
  })
  box(root, 22, 0.28, 18, 0, -0.19, 0, ground)
  box(root, 17.2, 0.055, 13.5, 0, -0.02, 0, paving)

  // A legible road loop, interior service lane, sidewalks and parking bays.
  for (const z of [-7.35, 7.35]) {
    box(roads, 19.8, 0.065, 1.3, 0, 0.025, z, asphalt)
    for (const edge of [-0.72, 0.72]) box(roads, 19.8, 0.055, 0.12, 0, 0.04, z + edge, curb)
    for (let x = -8.7; x < 9; x += 1.1) box(roads, 0.48, 0.012, 0.035, x, 0.067, z, roadMark)
  }
  for (const x of [-9.15, 9.15]) {
    box(roads, 1.3, 0.065, 14.7, x, 0.025, 0, asphalt)
    for (const edge of [-0.72, 0.72]) box(roads, 0.12, 0.055, 14.7, x + edge, 0.04, 0, curb)
    for (let z = -6.5; z < 7; z += 1.1) box(roads, 0.035, 0.012, 0.48, x, 0.067, z, roadMark)
  }
  box(roads, 0.92, 0.055, 10.4, 2.8, 0.025, 1.45, asphalt)
  box(roads, 16.6, 0.055, 0.85, 0, 0.025, -2.05, asphalt)
  for (let x = -1.8; x < 1.9; x += 0.35) box(roads, 0.18, 0.014, 0.82, x, 0.07, 7.35, roadMark)
  const parkedColors = [0xb7c7c6, 0x638fa6, 0xd2b28d, 0x47776c]
  const carBodyMaterials = parkedColors.map((color) => material(color))
  const carGlass = material(0x193c4b)
  function car(parent: THREE.Group, index: number) {
    const group = new THREE.Group()
    parent.add(group)
    box(group, 0.22, 0.095, 0.46, 0, 0.11, 0, carBodyMaterials[index % carBodyMaterials.length])
    box(group, 0.185, 0.08, 0.24, 0, 0.19, -0.025, carGlass)
    return group
  }
  for (let i = 0; i < 13; i++) {
    const x = -7.0 + i * 0.44
    line(roads, [v(x, 0.073, -6.65), v(x, 0.073, -6.13), v(x + 0.36, 0.073, -6.13)], 0x77918c, 0.8)
    if (i % 4 !== 1) car(roads, i).position.set(x + 0.18, 0, -6.4)
  }
  for (let i = 0; i < 7; i++) {
    const z = -0.7 + i * 0.55
    line(roads, [v(-8.25, 0.073, z), v(-7.7, 0.073, z), v(-7.7, 0.073, z + 0.43)], 0x77918c, 0.8)
    if (i % 3 !== 0) {
      const vehicle = car(roads, i)
      vehicle.position.set(-7.96, 0, z + 0.21)
      vehicle.rotation.y = Math.PI / 2
    }
  }

  // Compact landscaped courtyard with a reflective pond and shaded promenade.
  const lawn = mesh(greenery, new THREE.CylinderGeometry(2.42, 2.42, 0.075, 48), grass)
  lawn.position.set(-0.35, 0.055, 0.55)
  lawn.scale.z = 0.91
  const path = mesh(greenery, new THREE.RingGeometry(1.75, 1.96, 56), concrete)
  path.rotation.x = -Math.PI / 2
  path.position.set(-0.35, 0.1, 0.55)
  path.scale.y = 0.91
  const pond = mesh(greenery, new THREE.CylinderGeometry(0.85, 0.9, 0.055, 48), material(0x306976))
  pond.position.set(-0.25, 0.115, 0.35)
  pond.scale.set(1.42, 1, 0.87)
  const island = mesh(greenery, new THREE.CylinderGeometry(0.24, 0.3, 0.1, 24), concrete)
  island.position.set(-0.1, 0.18, 0.3)
  const sculpture = mesh(greenery, new THREE.TorusGeometry(0.32, 0.035, 8, 40), material(0x94dbc4))
  sculpture.position.set(-0.1, 0.53, 0.3)
  sculpture.rotation.y = -0.5
  for (let i = 0; i < 5; i++) {
    const x = -1.18 + i * 0.32
    box(greenery, 0.22, 0.1, 0.58, x, 0.2, 1.77, material(0x796e58))
  }
  for (const [x, z, w, d] of [
    [-10.45, 0, 0.65, 16],
    [10.45, 0, 0.65, 16],
    [0, 8.55, 19.8, 0.55],
    [0, -8.55, 19.8, 0.55],
  ] as const) {
    box(greenery, w, 0.09, d, x, 0.025, z, grass)
  }
  const trunkGeometry = new THREE.CylinderGeometry(0.035, 0.055, 0.36, 7)
  const crownGeometry = new THREE.IcosahedronGeometry(0.3, 1)
  function tree(x: number, z: number, index: number, scale = 1) {
    const treeGroup = new THREE.Group()
    greenery.add(treeGroup)
    treeGroup.position.set(x, 0.1, z)
    treeGroup.scale.setScalar(scale)
    const trunk = mesh(treeGroup, trunkGeometry, bark)
    trunk.position.y = 0.18
    const crown = mesh(treeGroup, crownGeometry, index % 2 ? leaf : darkLeaf)
    crown.position.y = 0.54
    crown.scale.y = 1.22
  }
  for (let i = 0; i < 13; i++) {
    tree(-10.43, -7.3 + i * 1.18, i, 0.95)
    tree(10.43, -7.3 + i * 1.18, i + 1, 0.95)
  }
  for (let i = 0; i < 14; i++) {
    tree(-8.3 + i * 1.26, 8.52, i, 0.8)
    tree(-8.3 + i * 1.26, -8.52, i + 1, 0.8)
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    tree(-0.35 + Math.cos(a) * 2.1, 0.55 + Math.sin(a) * 1.83, i, 0.72 + (i % 3) * 0.08)
  }
  for (const [x, z] of [
    [-3.35, 2.2],
    [-3.35, 3.3],
    [-3.35, 4.4],
    [1.28, 4.6],
    [1.28, 5.7],
    [7.7, -4.9],
    [7.7, -3.7],
  ])
    tree(x, z, Math.round(x + z), 0.86)

  function createBuilding(data: CampusBuilding): BuildingView {
    const { x, z, width, depth, floors, floorHeight, kind } = data
    const height = floors * floorHeight
    const group = new THREE.Group()
    group.position.set(x, 0.09, z)
    group.userData.objectId = data.id
    buildings.add(group)
    const bodyColor =
      kind === 'factory' ? 0x789598 : kind === 'office' ? 0xa5b7b2 : kind === 'research' ? 0x658e9c : 0x7f9d95
    const shell = material(bodyColor)
    const glass = material(kind === 'research' ? 0x205267 : 0x234752)
    glass.roughness = 0.24
    glass.metalness = 0.42
    const trim = material(0xacc3bd)
    const roof = material(0x4c6970)
    const accent = material(kind === 'factory' ? 0xb0a681 : 0x71b6a5)
    const clip = new THREE.Plane(v(0, -1, 0), 0.09 + height * 0.57)
    const clippedMaterials: THREE.Material[] = [shell, glass, trim, roof, accent]
    box(group, width + 0.16, 0.075, depth + 0.16, 0, 0, 0, trim)
    const body = box(group, width, height, depth, 0, height / 2, 0, shell)
    const edgeGeometry = new THREE.EdgesGeometry(body.geometry)
    const edges = new THREE.LineBasicMaterial({
      color: 0x87c3be,
      transparent: true,
      opacity: 0.28,
      clippingPlanes: [],
    })
    clippedMaterials.push(edges)
    const outline = new THREE.LineSegments(edgeGeometry, edges)
    outline.position.copy(body.position)
    group.add(outline)
    for (let floor = 0; floor < floors; floor++) {
      const y = (floor + 0.53) * floorHeight
      for (const side of [-1, 1]) {
        box(group, width * 0.9, floorHeight * 0.47, 0.018, 0, y, side * (depth / 2 + 0.012), glass)
        box(group, 0.018, floorHeight * 0.47, depth * 0.84, side * (width / 2 + 0.012), y, 0, glass)
        box(group, width + 0.035, 0.04, 0.055, 0, (floor + 1) * floorHeight - 0.035, (side * depth) / 2, trim)
      }
    }
    const mullions = Math.max(3, Math.floor(width / 0.42))
    for (let i = 1; i < mullions; i++) {
      const px = -width / 2 + (i / mullions) * width
      for (const side of [-1, 1])
        box(group, 0.035, height - 0.12, 0.028, px, height / 2, side * (depth / 2 + 0.025), trim)
    }
    box(group, width + 0.08, 0.1, depth + 0.08, 0, height + 0.01, 0, roof)
    for (const side of [-1, 1]) {
      box(group, width, 0.1, 0.045, 0, height + 0.1, (side * depth) / 2, trim)
      box(group, 0.045, 0.1, depth, (side * width) / 2, height + 0.1, 0, trim)
    }
    // Roof equipment, skylights and solar strips distinguish each building use.
    if (kind === 'factory') {
      for (let i = 0; i < 4; i++) {
        const px = -width * 0.32 + i * width * 0.215
        box(group, width * 0.13, 0.11, depth * 0.64, px, height + 0.14, 0, glass)
      }
      for (let i = 0; i < 3; i++)
        box(group, 0.4, 0.16, 0.27, -width * 0.3 + i * 0.55, height + 0.15, depth * 0.39, accent)
    } else {
      box(group, width * 0.4, 0.18, depth * 0.36, -width * 0.16, height + 0.17, -depth * 0.18, trim)
      for (let i = 0; i < 3; i++) {
        const panel = box(
          group,
          0.31,
          0.035,
          depth * 0.34,
          width * 0.13 + i * 0.4,
          height + 0.15,
          depth * 0.16,
          glass,
        )
        panel.rotation.x = -0.16
      }
    }
    // Entrance canopy and a front-facing inset portal anchor the scale.
    box(group, width * 0.32, 0.5, 0.045, 0, 0.26, depth / 2 + 0.028, glass)
    box(group, width * 0.42, 0.055, 0.48, 0, 0.55, depth / 2 + 0.18, accent)
    const floorGroup = new THREE.Group()
    group.add(floorGroup)
    const slab = material(0x98c6b8)
    const core = material(0x628b88)
    clippedMaterials.push(slab, core)
    for (let floor = 0; floor < floors; floor++) {
      box(floorGroup, width - 0.06, 0.045, depth - 0.06, 0, floor * floorHeight + 0.035, 0, slab)
      for (const px of [-width * 0.27, width * 0.27])
        for (const pz of [-depth * 0.25, depth * 0.25]) {
          box(floorGroup, 0.055, floorHeight, 0.055, px, (floor + 0.5) * floorHeight, pz, core)
        }
    }
    box(floorGroup, width * 0.17, height, depth * 0.22, -width * 0.12, height / 2, -depth * 0.13, core)
    floorGroup.visible = false
    const halo = line(
      group,
      [
        v(-width / 2 - 0.16, 0.08, -depth / 2 - 0.16),
        v(width / 2 + 0.16, 0.08, -depth / 2 - 0.16),
        v(width / 2 + 0.16, 0.08, depth / 2 + 0.16),
        v(-width / 2 - 0.16, 0.08, depth / 2 + 0.16),
        v(-width / 2 - 0.16, 0.08, -depth / 2 - 0.16),
      ],
      palette.amber,
      1,
    )
    halo.visible = false
    const pin = new THREE.Group()
    group.add(pin)
    pin.position.set(width * 0.36, height + 0.3, -depth * 0.3)
    const pinTop = mesh(pin, new THREE.OctahedronGeometry(0.09), signal)
    pinTop.position.y = 0.12
    line(pin, [v(0, -0.2, 0), v(0, 0.04, 0)], palette.mint, 0.7)
    pin.visible = false
    compactMeshes(floorGroup)
    const surfaces = compactMeshes(group)
    group.traverse((object) => {
      object.userData.objectId = data.id
    })
    pickables.push(...surfaces)
    const shadow = mesh(shadows, new THREE.BufferGeometry(), shadowMat)
    shadow.renderOrder = 1
    return { data, group, shell, edges, clippedMaterials, clip, floors: floorGroup, halo, pin, shadow }
  }
  for (const building of campusBuildings) views.push(createBuilding(building))
  compactMeshes(roads, true)
  compactMeshes(greenery, true)

  // Directional lighting and inexpensive projected silhouettes convey a
  // fictional time of day. This is intentionally not a georeferenced sun study.
  const sun = new THREE.DirectionalLight(0xffdfad, 2.5)
  const sunTarget = new THREE.Object3D()
  sunTarget.position.set(0, 0, 0)
  sun.target = sunTarget
  root.add(sun, sunTarget)
  const movingCars = Array.from({ length: 3 }, (_, i) => car(roads, i))
  let lastHour = Number.NaN
  let lastVisualKey = ''
  let lastSnapshotKey = ''

  function updateSun(hour: number) {
    const phase = (hour - 8) / 10
    const angle = phase * Math.PI
    sun.position.set(Math.cos(angle) * -15, 7 + Math.sin(angle) * 13, -9 + phase * 8)
    sun.intensity = 1.7 + Math.sin(angle) * 1.0
    sun.color.setHex(hour < 10 || hour > 16 ? 0xffd4a0 : 0xe2f8ed)
    for (const view of views) {
      const { x, z, width, depth, floors, floorHeight } = view.data
      const height = floors * floorHeight
      const dx = (-sun.position.x / sun.position.y) * height
      const dz = (-sun.position.z / sun.position.y) * height
      const corners = [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => new THREE.Vector2(x + (sx * width) / 2, z + (sz * depth) / 2)),
      )
      const hull = convexHull([...corners, ...corners.map((p) => new THREE.Vector2(p.x + dx, p.y + dz))])
      const shape = new THREE.Shape(hull)
      const geometry = new THREE.ShapeGeometry(shape)
      geometry.rotateX(Math.PI / 2)
      geometry.translate(0, 0.075, 0)
      view.shadow.geometry.dispose()
      view.shadow.geometry = geometry
    }
  }

  function snapshot(options: SceneOptions, hour: number): SceneSnapshot {
    const cutId = options.xray ? (options.selectedId ?? campusBuildings[0].id) : null
    const minute = Math.round((hour % 1) * 60)
    return {
      metrics: [
        { label: '用地面积', value: campusSiteArea, unit: 'm²' },
        { label: '建筑数量', value: campusBuildings.length, unit: '栋' },
        {
          label: '示意总建筑面积',
          value: campusBuildings.reduce(
            (sum, building) => sum + campusBuildingMeasures(building).floorArea,
            0,
          ),
          unit: 'm²',
        },
        { label: '示意时刻', value: `${Math.floor(hour)}:${String(minute).padStart(2, '0')}` },
      ],
      objects: campusBuildings.map((building) => {
        const measures = campusBuildingMeasures(building)
        return {
          id: building.id,
          title: building.name,
          subtitle: building.use,
          status: 'normal',
          details: [
            { label: '建筑用途', value: building.use },
            { label: '建筑层数', value: String(building.floors) },
            { label: '建筑高度', value: `${measures.height} m` },
            { label: '建筑占地', value: `${measures.footprint.toLocaleString('en-US')} m²` },
            { label: '示意建筑面积', value: `${measures.floorArea.toLocaleString('en-US')} m²` },
            { label: '当前视图', value: building.id === cutId ? '半高剖切' : '完整建筑' },
            { label: '数据来源', value: '参数化概念模型' },
          ],
        }
      }),
      message: options.xray ? messages.analysis : messages[options.mode],
    }
  }

  return {
    root,
    pickables,
    update(options, time) {
      const hour = THREE.MathUtils.clamp(options.value, 8, 18)
      if (hour !== lastHour) {
        lastHour = hour
        updateSun(hour)
      }
      const visualKey = [
        options.selectedId,
        options.xray,
        options.mode,
        options.showBuildings,
        options.showRoads,
        options.showGreenery,
      ].join('|')
      if (visualKey !== lastVisualKey) {
        lastVisualKey = visualKey
        buildings.visible = options.showBuildings
        shadows.visible = options.showBuildings
        roads.visible = options.showRoads
        greenery.visible = options.showGreenery
        const cutId = options.xray ? (options.selectedId ?? campusBuildings[0].id) : null
        for (const view of views) {
          const selected = options.selectedId === view.data.id || cutId === view.data.id
          const cut = cutId === view.data.id
          view.shell.emissive.setHex(selected ? 0x236455 : 0x000000)
          view.shell.emissiveIntensity = selected ? 0.38 : 0
          view.edges.color.setHex(selected ? palette.amber : palette.mint)
          view.edges.opacity = selected ? 0.9 : options.mode === 'analysis' ? 0.56 : 0.24
          view.halo.visible = selected
          view.pin.visible = options.mode === 'analysis' && !cut
          view.floors.visible = cut
          // Shared scene materials never receive these local clipping planes.
          for (const mat of view.clippedMaterials) {
            mat.clippingPlanes = cut ? [view.clip] : []
            mat.needsUpdate = true
          }
        }
        movingCars.forEach((vehicle) => {
          vehicle.visible = options.mode === 'process'
        })
      }
      if (options.mode === 'process') {
        const points = [v(-9.15, 0, -7.35), v(9.15, 0, -7.35), v(9.15, 0, 7.35), v(-9.15, 0, 7.35)]
        movingCars.forEach((vehicle, index) => {
          const p = (((time * 0.075 + index * 1.33) % 4) + 4) % 4
          const edge = Math.floor(p)
          const from = points[edge]
          const to = points[(edge + 1) % 4]
          vehicle.position.lerpVectors(from, to, p - edge)
          vehicle.rotation.y = Math.atan2(to.x - from.x, to.z - from.z)
        })
      }
      const snapshotKey = [hour, options.mode, options.xray, options.selectedId].join('|')
      if (snapshotKey !== lastSnapshotKey) {
        lastSnapshotKey = snapshotKey
        publish(snapshot(options, hour))
      }
    },
    focus(id) {
      const building = campusBuildings.find((item) => item.id === id)
      if (!building) return null
      const height = building.floors * building.floorHeight
      const target = v(building.x, height * 0.42, building.z)
      return { position: target.clone().add(v(6.5, 6.7, 8.6)), target }
    },
  }
}
