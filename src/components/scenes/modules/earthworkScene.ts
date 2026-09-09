import * as THREE from 'three'
import { baseTile, beam, box, line, material, mesh, palette, v } from '../sceneKit'
import { METERS_PER_UNIT, type PublishScene, type SceneModule, type SceneOptions } from '../sceneTypes'
import { calculateEarthwork, type TerrainGrid } from './terrainAnalysis'

const COLUMNS = 88
const ROWS = 72
const STEP = 0.25
const originalHeight = (x: number, z: number) =>
  0.42 +
  3.4 * Math.exp(-((x + 3) ** 2 / 15 + (z + 1.8) ** 2 / 15)) +
  1.25 * Math.exp(-((x - 5) ** 2 / 12 + (z - 4) ** 2 / 10)) +
  0.1 * Math.sin(x * 0.8) * Math.cos(z * 0.65)

// A 15 x 11 unit work boundary includes a graded perimeter, not a vertical step.
const workWeight = (x: number, z: number) => {
  const distance = Math.min(7.5 - Math.abs(x), 5.5 - Math.abs(z))
  return THREE.MathUtils.smoothstep(distance, 0, 1.25)
}
const designHeight = (x: number, z: number, elevation: number) =>
  THREE.MathUtils.lerp(originalHeight(x, z), elevation, workWeight(x, z))

export function createEarthworkScene(publish: PublishScene): SceneModule {
  const root = new THREE.Group()
  root.name = 'Earthwork: cut and fill process'
  baseTile(root)
  const groundGeometry = new THREE.PlaneGeometry(22, 18, COLUMNS, ROWS)
  groundGeometry.rotateX(-Math.PI / 2)
  const positions = groundGeometry.getAttribute('position')
  const originalVertices = new Float32Array(positions.count)
  const colorArray = new Float32Array(positions.count * 3)
  for (let i = 0; i < positions.count; i++) {
    originalVertices[i] = originalHeight(positions.getX(i), positions.getZ(i))
    positions.setY(i, originalVertices[i])
  }
  groundGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
  groundGeometry.computeVertexNormals()
  mesh(
    root,
    groundGeometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, side: THREE.DoubleSide }),
  )
  const ghostGeometry = new THREE.WireframeGeometry(groundGeometry)
  const ghost = new THREE.LineSegments(
    ghostGeometry,
    new THREE.LineBasicMaterial({
      color: 0xbcdbd5,
      transparent: true,
      opacity: 0.19,
      depthWrite: false,
    }),
  )
  ghost.position.y = 0.045
  root.add(ghost)

  const perimeter: THREE.Vector2[] = []
  for (let i = 0; i < COLUMNS; i++) perimeter.push(new THREE.Vector2(-11 + i * STEP, -9))
  for (let i = 0; i < ROWS; i++) perimeter.push(new THREE.Vector2(11, -9 + i * STEP))
  for (let i = 0; i < COLUMNS; i++) perimeter.push(new THREE.Vector2(11 - i * STEP, 9))
  for (let i = 0; i < ROWS; i++) perimeter.push(new THREE.Vector2(-11, 9 - i * STEP))
  const sideGeometry = new THREE.BufferGeometry()
  const sideArray = new Float32Array(perimeter.length * 18)
  sideGeometry.setAttribute('position', new THREE.BufferAttribute(sideArray, 3))
  mesh(root, sideGeometry, material(0x28434a))

  const originalCells = new Float32Array(COLUMNS * ROWS)
  const targetCells = new Float32Array(COLUMNS * ROWS)
  const workMask = new Uint8Array(COLUMNS * ROWS)
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLUMNS; col++) {
      const i = row * COLUMNS + col,
        x = -11 + (col + 0.5) * STEP,
        z = -9 + (row + 0.5) * STEP
      originalCells[i] = originalHeight(x, z) * METERS_PER_UNIT
      workMask[i] = workWeight(x, z) > 0 ? 1 : 0
    }
  const grid: TerrainGrid = {
    columns: COLUMNS,
    rows: ROWS,
    cellSizeMeters: STEP * METERS_PER_UNIT,
    heights: originalCells,
  }

  const designGuide = new THREE.Group()
  root.add(designGuide)
  const plane = mesh(
    designGuide,
    new THREE.PlaneGeometry(12.5, 8.5),
    new THREE.MeshBasicMaterial({
      color: palette.mint,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  plane.rotation.x = -Math.PI / 2
  for (let x = -6; x <= 6; x += 2)
    line(designGuide, [v(x, 0.01, -4.25), v(x, 0.01, 4.25)], palette.mint, 0.25)
  for (let z = -4; z <= 4; z += 2)
    line(designGuide, [v(-6.25, 0.01, z), v(6.25, 0.01, z)], palette.mint, 0.25)
  line(
    designGuide,
    [
      v(-6.25, 0.015, -4.25),
      v(6.25, 0.015, -4.25),
      v(6.25, 0.015, 4.25),
      v(-6.25, 0.015, 4.25),
      v(-6.25, 0.015, -4.25),
    ],
    palette.mint,
    0.75,
  )
  const boundaryPoints = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 4
    if (t <= 1) return new THREE.Vector2(-7.5 + t * 15, -5.5)
    if (t <= 2) return new THREE.Vector2(7.5, -5.5 + (t - 1) * 11)
    if (t <= 3) return new THREE.Vector2(7.5 - (t - 2) * 15, 5.5)
    return new THREE.Vector2(-7.5, 5.5 - (t - 3) * 11)
  })
  const boundary = line(
    root,
    boundaryPoints.map((p) => v(p.x, originalHeight(p.x, p.y) + 0.06, p.y)),
    palette.amber,
    0.65,
  )
  boundary.name = 'Construction boundary'
  const surveyMaterial = material(0xbad0c4)
  for (const x of [-7.5, 7.5])
    for (const z of [-5.5, 5.5]) {
      const y = originalHeight(x, z)
      beam(root, v(x, y, z), v(x, y + 0.9, z), 0.025, surveyMaterial)
      box(root, 0.2, 0.18, 0.1, x, y + 0.92, z, material(palette.amber))
    }

  const markerSpecs = [
    { id: 'earthwork-cut', x: -3, z: -1.8, color: 0xc98571 },
    { id: 'earthwork-fill', x: 4.8, z: -3, color: palette.mint },
  ]
  const pickables: THREE.Object3D[] = []
  const markers = markerSpecs.map((spec) => {
    const group = new THREE.Group()
    group.position.set(spec.x, 0, spec.z)
    root.add(group)
    const ring = mesh(group, new THREE.TorusGeometry(0.4, 0.045, 8, 36), material(spec.color))
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.08
    const head = mesh(group, new THREE.OctahedronGeometry(0.23), material(spec.color))
    head.position.y = 1.15
    head.userData.objectId = spec.id
    ring.userData.objectId = spec.id
    beam(group, v(0, 0.1, 0), v(0, 0.95, 0), 0.025, material(spec.color))
    pickables.push(head, ring)
    return { group, ring, head, spec }
  })

  const routeCoordinates = Array.from({ length: 129 }, (_, i) => {
    const angle = (i / 128) * Math.PI * 2
    return new THREE.Vector2(Math.cos(angle) * 6.35, Math.sin(angle) * 4.35)
  })
  const route = line(
    root,
    routeCoordinates.map((p) => v(p.x, originalHeight(p.x, p.y) + 0.12, p.y)),
    0xe5d3a6,
    0.75,
  )
  const dark = material(0x17333e),
    amber = material(palette.amber),
    white = material(0xc9d5d0)
  const trucks = Array.from({ length: 3 }, () => {
    const truck = new THREE.Group()
    root.add(truck)
    box(truck, 0.95, 0.15, 0.44, 0, 0.25, 0, dark)
    box(truck, 0.27, 0.34, 0.43, 0.33, 0.44, 0, white)
    box(truck, 0.29, 0.13, 0.45, 0.34, 0.49, 0, material(0x244753))
    const bed = new THREE.Group()
    bed.position.set(-0.36, 0.35, 0)
    truck.add(bed)
    box(bed, 0.62, 0.18, 0.42, 0.2, 0.08, 0, amber)
    box(bed, 0.48, 0.08, 0.3, 0.2, 0.21, 0, material(0x8c7250))
    for (const x of [-0.32, 0.31])
      for (const z of [-0.25, 0.25]) {
        const tire = mesh(truck, new THREE.CylinderGeometry(0.13, 0.13, 0.09, 10), dark)
        tire.rotation.x = Math.PI / 2
        tire.position.set(x, 0.14, z)
      }
    return { truck, bed }
  })
  const excavator = new THREE.Group()
  root.add(excavator)
  box(excavator, 1.1, 0.22, 0.65, 0, 0.15, 0, dark)
  box(excavator, 0.8, 0.36, 0.53, -0.12, 0.43, 0, amber)
  box(excavator, 0.35, 0.39, 0.43, -0.31, 0.78, 0, white)
  box(excavator, 0.36, 0.23, 0.44, -0.31, 0.81, 0, dark)
  const arm = new THREE.Group()
  arm.position.set(0.22, 0.59, 0)
  excavator.add(arm)
  beam(arm, v(0, 0, 0), v(0.6, 0.95, 0), 0.08, amber)
  beam(arm, v(0.6, 0.95, 0), v(1.18, 0.13, 0), 0.065, amber)
  box(arm, 0.42, 0.26, 0.43, 1.28, 0.01, 0, dark)

  let previousKey = '',
    currentFraction = 1,
    currentElevation = 1.8
  const currentHeight = (x: number, z: number) =>
    THREE.MathUtils.lerp(originalHeight(x, z), designHeight(x, z, currentElevation), currentFraction)
  const earthColor = new THREE.Color(0x477366),
    highColor = new THREE.Color(0x92a184)
  const cutColor = new THREE.Color(0xc98571),
    fillColor = new THREE.Color(0x419e94)

  function sync(options: SceneOptions) {
    currentElevation = options.value / METERS_PER_UNIT
    currentFraction =
      options.mode === 'analysis' ? 1 : options.mode === 'overview' ? 0 : options.progress / 100
    ghost.visible = options.showOriginal && options.mode !== 'overview'
    designGuide.position.y = currentElevation + 0.06
    designGuide.visible = options.mode !== 'analysis' || options.showOriginal
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        z = positions.getZ(i),
        original = originalVertices[i]
      positions.setY(i, currentHeight(x, z))
      const weight = workWeight(x, z)
      const color = earthColor.clone().lerp(highColor, Math.min(original / 4.2, 1))
      if (weight > 0 && options.mode !== 'overview')
        color.lerp(original > currentElevation ? cutColor : fillColor, weight * 0.8)
      color.toArray(colorArray, i * 3)
    }
    positions.needsUpdate = true
    groundGeometry.getAttribute('color').needsUpdate = true
    groundGeometry.computeVertexNormals()
    groundGeometry.computeBoundingSphere()
    perimeter.forEach((point, i) => {
      const next = perimeter[(i + 1) % perimeter.length]
      sideArray.set(
        [
          point.x,
          currentHeight(point.x, point.y),
          point.y,
          point.x,
          -0.38,
          point.y,
          next.x,
          currentHeight(next.x, next.y),
          next.y,
          next.x,
          currentHeight(next.x, next.y),
          next.y,
          point.x,
          -0.38,
          point.y,
          next.x,
          -0.38,
          next.y,
        ],
        i * 18,
      )
    })
    sideGeometry.getAttribute('position').needsUpdate = true
    sideGeometry.computeVertexNormals()
    sideGeometry.computeBoundingSphere()
    const routePosition = route.geometry.getAttribute('position')
    routeCoordinates.forEach((point, i) => routePosition.setY(i, currentHeight(point.x, point.y) + 0.08))
    routePosition.needsUpdate = true
    route.geometry.computeBoundingSphere()
    const regions = [
      { maximumDifference: 0, cellIndex: -1, area: 0 },
      { maximumDifference: 0, cellIndex: -1, area: 0 },
    ]
    for (let row = 0; row < ROWS; row++)
      for (let col = 0; col < COLUMNS; col++) {
        const index = row * COLUMNS + col
        targetCells[index] =
          designHeight(-11 + (col + 0.5) * STEP, -9 + (row + 0.5) * STEP, currentElevation) * METERS_PER_UNIT
        if (!workMask[index]) continue
        const difference = originalCells[index] - targetCells[index]
        if (Math.abs(difference) < 0.0001) continue
        const region = regions[difference > 0 ? 0 : 1]
        region.area += grid.cellSizeMeters ** 2
        if (Math.abs(difference) > region.maximumDifference) {
          region.maximumDifference = Math.abs(difference)
          region.cellIndex = index
        }
      }
    const result = calculateEarthwork(grid, targetCells, workMask)
    const volumes = [result.cutVolume, result.fillVolume]
    const activeRegions = regions.map((region, i) => region.cellIndex >= 0 && volumes[i] >= 0.5)
    markers.forEach(({ group, ring, spec }, i) => {
      const index = regions[i].cellIndex
      group.visible = activeRegions[i]
      if (activeRegions[i]) {
        // Locate each marker on its largest actual, graded cut/fill difference.
        spec.x = -11 + ((index % COLUMNS) + 0.5) * STEP
        spec.z = -9 + (Math.floor(index / COLUMNS) + 0.5) * STEP
        group.position.set(spec.x, currentHeight(spec.x, spec.z), spec.z)
      }
      ring.scale.setScalar(options.selectedId === spec.id ? 1.35 : 1)
    })
    pickables.length = 0
    markers.forEach(({ head, ring }, i) => {
      if (activeRegions[i]) pickables.push(head, ring)
    })
    excavator.visible = activeRegions[0]
    const phase =
      options.mode === 'overview' ? '原始地形' : options.mode === 'analysis' ? '设计完成面' : '施工过程'
    publish({
      metrics: [
        { label: '挖方量', value: Math.round(result.cutVolume), unit: 'm³' },
        { label: '填方量', value: Math.round(result.fillVolume), unit: 'm³' },
        { label: '余缺方量', value: Math.round(result.netVolume), unit: 'm³' },
        { label: '施工完成', value: Math.round(currentFraction * 100), unit: '%' },
      ],
      progress: Math.round(currentFraction * 100),
      objects: markerSpecs.map((spec, i) => ({
        id: spec.id,
        title: activeRegions[i]
          ? i === 0
            ? '开挖区 · 山体削坡'
            : '填筑区 · 场地抬升'
          : i === 0
            ? '开挖区 · 当前无挖方'
            : '填筑区 · 当前无填方',
        subtitle: activeRegions[i]
          ? i === 0
            ? '珊瑚区域 / 削方作业'
            : '青绿区域 / 分层回填'
          : i === 0
            ? '该标高下无需开挖'
            : '该标高下无需填筑',
        status: 'normal',
        details: [
          ...(activeRegions[i]
            ? [
                {
                  label: '原始高程',
                  value: `${(originalHeight(spec.x, spec.z) * METERS_PER_UNIT).toFixed(1)} m`,
                },
                {
                  label: '当前高程',
                  value: `${(currentHeight(spec.x, spec.z) * METERS_PER_UNIT).toFixed(1)} m`,
                },
              ]
            : [{ label: '分析状态', value: i === 0 ? '该设计标高下无挖方。' : '该设计标高下无填方。' }]),
          { label: '设计标高', value: `${options.value.toFixed(1)} m` },
          { label: '施工阶段', value: phase },
          { label: '区域面积', value: `${Math.round(regions[i].area).toLocaleString('en-US')} m²` },
          { label: '总作业面积', value: `${Math.round(result.area).toLocaleString('en-US')} m²` },
          { label: '栅格精度', value: '2.5 m' },
        ],
      })),
      message:
        options.mode === 'overview'
          ? '原始地形与设计面叠加；切换挖填分析查看削坡与回填区域。'
          : '合成地形 · 方量按 2.5 m 栅格积分，正余量表示外运、负余量表示借方。',
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
        options.showOriginal,
        options.selectedId,
        options.resetVersion,
      ].join('|')
      if (key !== previousKey) {
        previousKey = key
        sync(options)
      }
      trucks.forEach(({ truck, bed }, i) => {
        const angle = time * 0.2 + (i * Math.PI * 2) / 3
        const x = Math.cos(angle) * 6.35,
          z = Math.sin(angle) * 4.35
        truck.position.set(x, currentHeight(x, z) + 0.045, z)
        truck.rotation.y = -Math.atan2(Math.cos(angle) * 4.35, -Math.sin(angle) * 6.35)
        bed.rotation.z = options.mode === 'process' ? Math.max(0, Math.sin(angle - 1)) ** 10 * 0.4 : 0
      })
      const excavatorX = markerSpecs[0].x - 0.8,
        excavatorZ = markerSpecs[0].z - 0.65
      excavator.position.set(excavatorX, currentHeight(excavatorX, excavatorZ) + 0.06, excavatorZ)
      excavator.rotation.y = -0.7
      arm.rotation.z = options.mode === 'process' ? Math.sin(time * 1.2) * 0.14 : 0
      markers.forEach(({ head }) => {
        head.rotation.y = time * 0.5
      })
    },
    focus(id) {
      const marker = markers.find(({ spec }) => spec.id === id)
      if (!marker || !marker.group.visible) return null
      const target = marker.group.position.clone().add(v(0, 0.4, 0))
      return { target, position: target.clone().add(v(6, 5, 7)) }
    },
  }
}
