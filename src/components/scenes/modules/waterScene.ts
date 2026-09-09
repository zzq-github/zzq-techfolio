import * as THREE from 'three'
import { baseTile, beam, box, line, material, mesh, palette, v } from '../sceneKit'
import {
  METERS_PER_UNIT,
  type PublishScene,
  type SceneModule,
  type SceneObject,
  type SceneOptions,
} from '../sceneTypes'
import { calculateConnectedFlood, type FloodResult, type TerrainGrid } from './terrainAnalysis'

const COLUMNS = 88
const ROWS = 72
const STEP = 0.25
const DAM_CREST = 26
const terrainHeight = (x: number, z: number) => {
  const valley =
    0.16 +
    4.65 * (1 - Math.exp(-((Math.abs(x) / 4.5) ** 1.85))) +
    0.065 * Math.sin(z * 0.7) +
    0.025 * Math.sin(x * 1.9 + z)
  const distance = Math.hypot((x - 7.5) / 1.9, (z + 2.8) / 2)
  if (distance > 1.4) return valley
  const basin = 0.65 + 3.9 * Math.min(distance / 0.95, 1) ** 4
  return THREE.MathUtils.lerp(basin, valley, THREE.MathUtils.smoothstep(distance, 1, 1.4))
}
const rasterIndex = (x: number, z: number) =>
  THREE.MathUtils.clamp(Math.floor((z + 9) / STEP), 0, ROWS - 1) * COLUMNS +
  THREE.MathUtils.clamp(Math.floor((x + 11) / STEP), 0, COLUMNS - 1)

export function createWaterScene(publish: PublishScene): SceneModule {
  const root = new THREE.Group()
  root.name = 'Connected water inundation analysis'
  baseTile(root)
  const geometry = new THREE.PlaneGeometry(22, 18, COLUMNS, ROWS)
  geometry.rotateX(-Math.PI / 2)
  const positions = geometry.getAttribute('position'),
    colors: number[] = []
  const low = new THREE.Color(0x32564d),
    high = new THREE.Color(0x75887c)
  for (let i = 0; i < positions.count; i++) {
    const height = terrainHeight(positions.getX(i), positions.getZ(i))
    positions.setY(i, height)
    const color = low.clone().lerp(high, Math.min(height / 7, 1))
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  mesh(
    root,
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, side: THREE.DoubleSide }),
  )
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x87b1a1, transparent: true, opacity: 0.055 }),
  )
  root.add(wire)
  const border: THREE.Vector2[] = []
  for (let i = 0; i < COLUMNS; i++) border.push(new THREE.Vector2(-11 + i * STEP, -9))
  for (let i = 0; i < ROWS; i++) border.push(new THREE.Vector2(11, -9 + i * STEP))
  for (let i = 0; i < COLUMNS; i++) border.push(new THREE.Vector2(11 - i * STEP, 9))
  for (let i = 0; i < ROWS; i++) border.push(new THREE.Vector2(-11, 9 - i * STEP))
  const sides: number[] = []
  border.forEach((a, i) => {
    const b = border[(i + 1) % border.length]
    sides.push(
      a.x,
      terrainHeight(a.x, a.y),
      a.y,
      a.x,
      -0.38,
      a.y,
      b.x,
      terrainHeight(b.x, b.y),
      b.y,
      b.x,
      terrainHeight(b.x, b.y),
      b.y,
      a.x,
      -0.38,
      a.y,
      b.x,
      -0.38,
      b.y,
    )
  })
  const skirt = new THREE.BufferGeometry()
  skirt.setAttribute('position', new THREE.Float32BufferAttribute(sides, 3))
  skirt.computeVertexNormals()
  mesh(root, skirt, material(0x243d42))

  const heights = new Float32Array(COLUMNS * ROWS),
    barrierCrests = new Float32Array(COLUMNS * ROWS)
  barrierCrests.fill(-Infinity)
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLUMNS; col++) {
      const i = row * COLUMNS + col,
        x = -11 + (col + 0.5) * STEP,
        z = -9 + (row + 0.5) * STEP
      heights[i] = terrainHeight(x, z) * METERS_PER_UNIT
      if (Math.abs(z - 2.5) <= 0.4 && Math.abs(x) <= 6) barrierCrests[i] = DAM_CREST
    }
  const grid: TerrainGrid = { columns: COLUMNS, rows: ROWS, cellSizeMeters: STEP * METERS_PER_UNIT, heights }
  const sources = [rasterIndex(0, -8.7), rasterIndex(-0.25, -8.7), rasterIndex(0.25, -8.7)]
  const waterGeometry = new THREE.BufferGeometry()
  const water = mesh(
    root,
    waterGeometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.86,
      roughness: 0.3,
      metalness: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  water.renderOrder = 2
  const shoreGeometry = new THREE.BufferGeometry()
  const shoreline = new THREE.LineSegments(
    shoreGeometry,
    new THREE.LineBasicMaterial({ color: 0x8fddd9, transparent: true, opacity: 0.85 }),
  )
  root.add(shoreline)

  const dam = new THREE.Group()
  root.add(dam)
  const concrete = material(0x81999b)
  box(dam, 12, 2.45, 0.65, 0, 1.225, 2.5, concrete)
  box(dam, 12.2, 0.15, 0.85, 0, 2.525, 2.5, material(0xc4d4c8))
  for (let x = -4; x <= 4; x += 1) {
    box(dam, 0.22, 2.35, 0.85, x, 1.175, 2.5, material(0x54757d))
    box(dam, 0.07, 0.25, 0.07, x, 2.725, 2.89, concrete)
  }
  line(dam, [v(-4, 2.85, 2.89), v(4, 2.85, 2.89)], palette.white, 0.6)

  const buildingSpecs = [
    {
      id: 'water-building-1',
      title: '沿岸泵房',
      x: -2.1,
      z: -5.5,
      width: 0.8,
      depth: 0.7,
      height: 0.7,
      use: '泵站设施',
    },
    {
      id: 'water-building-2',
      title: '沿岸管理站',
      x: 2.9,
      z: -1.6,
      width: 0.95,
      depth: 0.75,
      height: 1,
      use: '管理设施',
    },
    {
      id: 'water-building-3',
      title: '下游值守点',
      x: -1.4,
      z: 6,
      width: 0.8,
      depth: 0.7,
      height: 0.8,
      use: '下游设施',
    },
  ]
  const pickables: THREE.Object3D[] = []
  const buildings = buildingSpecs.map((spec) => {
    const group = new THREE.Group()
    root.add(group)
    const floor =
      Math.max(
        ...[-1, 1].flatMap((dx) =>
          [-1, 1].map((dz) => terrainHeight(spec.x + (dx * spec.width) / 2, spec.z + (dz * spec.depth) / 2)),
        ),
      ) + 0.12
    group.position.set(spec.x, floor, spec.z)
    const bodyMaterial = material(0xc1cebd)
    box(group, spec.width + 0.15, 0.45, spec.depth + 0.15, 0, -0.225, 0, material(0x58716c))
    const body = box(group, spec.width, spec.height, spec.depth, 0, spec.height / 2, 0, bodyMaterial)
    const roof = box(
      group,
      spec.width + 0.08,
      0.1,
      spec.depth + 0.08,
      0,
      spec.height + 0.05,
      0,
      material(0x294958),
    )
    for (const x of [-0.23, 0.23])
      box(group, 0.18, 0.21, 0.015, x, spec.height * 0.6, spec.depth / 2 + 0.01, material(0x65b9b0))
    const beacon = mesh(group, new THREE.OctahedronGeometry(0.15), material(palette.mint))
    beacon.position.y = spec.height + 0.45
    const halo = mesh(group, new THREE.TorusGeometry(0.66, 0.025, 8, 40), material(palette.mint))
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.03
    halo.visible = false
    for (const object of [body, roof, beacon]) {
      object.userData.objectId = spec.id
      pickables.push(object)
    }
    return { spec, group, bodyMaterial, beacon, halo, floor }
  })

  const roadCoordinates = Array.from({ length: 81 }, (_, i) => new THREE.Vector2(-4 + i * 0.1, -3.6))
  const road = line(
    root,
    roadCoordinates.map((p) => v(p.x, terrainHeight(p.x, p.y) + 0.05, p.y)),
    0xc9b995,
    0.9,
  )
  const basinMarker = mesh(root, new THREE.TorusGeometry(0.42, 0.045, 8, 40), material(palette.amber))
  basinMarker.rotation.x = -Math.PI / 2
  basinMarker.position.set(7.5, terrainHeight(7.5, -2.8) + 0.15, -2.8)
  basinMarker.userData.objectId = 'water-basin'
  pickables.push(basinMarker)
  beam(root, v(7.5, 0.8, -2.8), v(7.5, 2.05, -2.8), 0.025, material(palette.amber))
  const basinHead = mesh(root, new THREE.OctahedronGeometry(0.2), material(palette.amber))
  basinHead.position.set(7.5, 2.15, -2.8)
  basinHead.userData.objectId = 'water-basin'
  pickables.push(basinHead)
  const source = mesh(root, new THREE.TorusGeometry(0.37, 0.045, 8, 40), material(palette.mint))
  source.rotation.x = -Math.PI / 2
  source.position.set(0, 1.23, -7.8)
  const gauge = new THREE.Group()
  root.add(gauge)
  const gaugeX = -3.8,
    gaugeZ = 0.5
  const gaugeBase = terrainHeight(gaugeX, gaugeZ)
  beam(gauge, v(gaugeX, gaugeBase, gaugeZ), v(gaugeX, 4.1, gaugeZ), 0.055, material(0xc0ddd2))
  for (let y = Math.ceil(gaugeBase * 5) / 5; y <= 4; y += 0.2) {
    line(gauge, [v(gaugeX, y, gaugeZ), v(gaugeX + 0.18, y, gaugeZ)], palette.white, 0.75)
  }

  let lastKey = '',
    lastWaterLevel = -1,
    lastWaterMode = '',
    previousFlood: FloodResult | null = null
  let previousObjects: SceneObject[] = []
  function rebuildWater(level: number, flood: FloodResult, mode: SceneOptions['mode']) {
    const surfacePositions: number[] = [],
      surfaceColors: number[] = [],
      shore: number[] = []
    const shallow = new THREE.Color(mode === 'overview' ? 0x378c9e : 0x66d5c4)
    const deep = new THREE.Color(mode === 'overview' ? 0x1f6389 : 0x1c659a)
    const y = level / METERS_PER_UNIT + 0.012
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLUMNS; col++) {
        const i = row * COLUMNS + col
        if (!flood.flooded[i]) continue
        const x = -11 + col * STEP,
          z = -9 + row * STEP
        surfacePositions.push(
          x,
          y,
          z,
          x,
          y,
          z + STEP,
          x + STEP,
          y,
          z,
          x + STEP,
          y,
          z,
          x,
          y,
          z + STEP,
          x + STEP,
          y,
          z + STEP,
        )
        const color = shallow.clone().lerp(deep, Math.min(flood.depths[i] / 22, 1))
        for (let vertex = 0; vertex < 6; vertex++) surfaceColors.push(color.r, color.g, color.b)
        const sy = y + 0.02
        if (row === 0 || !flood.flooded[i - COLUMNS]) shore.push(x, sy, z, x + STEP, sy, z)
        if (row === ROWS - 1 || !flood.flooded[i + COLUMNS])
          shore.push(x, sy, z + STEP, x + STEP, sy, z + STEP)
        if (col === 0 || !flood.flooded[i - 1]) shore.push(x, sy, z, x, sy, z + STEP)
        if (col === COLUMNS - 1 || !flood.flooded[i + 1]) shore.push(x + STEP, sy, z, x + STEP, sy, z + STEP)
      }
    // Release old GPU attributes before replacing a variable-size raster surface.
    waterGeometry.dispose()
    shoreGeometry.dispose()
    waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(surfacePositions, 3))
    waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(surfaceColors, 3))
    waterGeometry.computeVertexNormals()
    waterGeometry.computeBoundingSphere()
    shoreGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shore, 3))
    shoreGeometry.computeBoundingSphere()
    shoreline.visible = mode !== 'overview'
    source.position.y = level / METERS_PER_UNIT + 0.08
  }

  function sync(options: SceneOptions) {
    const level =
      options.mode === 'process' ? 2 + ((options.value - 2) * options.progress) / 100 : options.value
    const flood =
      level === lastWaterLevel && previousFlood
        ? previousFlood
        : calculateConnectedFlood(grid, level, sources, barrierCrests)
    if (level !== lastWaterLevel || options.mode !== lastWaterMode) rebuildWater(level, flood, options.mode)
    lastWaterLevel = level
    lastWaterMode = options.mode
    previousFlood = flood
    let affectedCount = 0
    previousObjects = buildings.map(({ spec, floor, bodyMaterial, beacon, halo }) => {
      const connected = [-1, 0, 1].some((dx) =>
        [-1, 0, 1].some(
          (dz) => flood.flooded[rasterIndex(spec.x + (dx * spec.width) / 2, spec.z + (dz * spec.depth) / 2)],
        ),
      )
      const affected = !!connected && level > floor * METERS_PER_UNIT
      const depth = affected ? level - floor * METERS_PER_UNIT : 0
      if (affected) affectedCount++
      bodyMaterial.color.setHex(affected ? 0xd79a70 : 0xc1cebd)
      const beaconMaterial = beacon.material as THREE.MeshStandardMaterial
      beaconMaterial.color.setHex(affected ? palette.amber : palette.mint)
      beacon.position.y = Math.max(spec.height + 0.45, level / METERS_PER_UNIT - floor + 0.35)
      halo.visible = options.selectedId === spec.id
      halo.position.y = Math.max(0.03, level / METERS_PER_UNIT - floor + 0.035)
      return {
        id: spec.id,
        title: spec.title,
        subtitle: spec.use,
        status: affected ? 'affected' : 'normal',
        details: [
          { label: '场景状态', value: affected ? '已受淹 · 需要关注' : '未受淹' },
          { label: '首层高程', value: `${(floor * METERS_PER_UNIT).toFixed(1)} m` },
          { label: '分析水位', value: `${level.toFixed(1)} m` },
          { label: '首层水深', value: `${depth.toFixed(1)} m` },
          { label: '水源连通', value: connected ? '已连通' : '未连通' },
          { label: '对象来源', value: '程序化示例建筑' },
        ],
      }
    })
    const basinFlooded = !!flood.flooded[rasterIndex(7.5, -2.8)]
    previousObjects.push({
      id: 'water-basin',
      title: '隔离洼地 · 连通性验证',
      subtitle: '山脊阻隔 / 独立低洼区',
      status: basinFlooded ? 'affected' : 'normal',
      details: [
        { label: '洼地高程', value: '6.5 m' },
        { label: '分析水位', value: `${level.toFixed(1)} m` },
        { label: '水源连通', value: basinFlooded ? '已连通' : '未连通' },
        { label: '分析说明', value: '低于水位但与水源隔离，因此保持干燥。' },
      ],
    })
    const roadAffected = roadCoordinates.some((point) => flood.flooded[rasterIndex(point.x, point.y)])
    ;(road.material as THREE.LineBasicMaterial).color.setHex(roadAffected ? palette.amber : 0xc9b995)
    basinMarker.scale.setScalar(options.selectedId === 'water-basin' ? 1.35 : 1)
    publish({
      metrics: [
        { label: '当前水位', value: Number(level.toFixed(1)), unit: 'm' },
        { label: '淹没面积', value: Math.round(flood.area), unit: 'm²' },
        { label: '最大水深', value: Number(flood.maximumDepth.toFixed(1)), unit: 'm' },
        { label: '受影响建筑', value: affectedCount },
      ],
      objects: previousObjects,
      progress: options.mode === 'process' ? options.progress : 100,
      message:
        level <= DAM_CREST
          ? '静态水位分析 · 坝顶 26 m，当前水体受坝体阻隔；隔离洼地保持干燥。'
          : '静态水位分析 · 水位超过 26 m 坝顶，上下游已连通；不计算流速或洪峰到达时间。',
    })
  }

  return {
    root,
    pickables,
    update(options, time) {
      const key = [
        options.value,
        options.mode,
        options.progress,
        options.selectedId,
        options.resetVersion,
      ].join('|')
      if (key !== lastKey) {
        lastKey = key
        sync(options)
      }
      source.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08)
      buildings.forEach(({ beacon }) => {
        beacon.rotation.y = time * 0.5
      })
      basinHead.rotation.y = time * 0.4
    },
    focus(id) {
      const building = buildings.find(({ spec }) => spec.id === id)
      const target = building
        ? building.group.position.clone().add(v(0, 0.5, 0))
        : id === 'water-basin'
          ? v(7.5, 1.4, -2.8)
          : null
      return target ? { target, position: target.clone().add(v(5, 5, 6)) } : null
    },
  }
}
