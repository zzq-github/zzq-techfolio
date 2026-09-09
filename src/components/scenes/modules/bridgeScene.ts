import * as THREE from 'three'
import { baseTile, beam, box, line, material, mesh, palette, v } from '../sceneKit'
import { METERS_PER_UNIT, type PublishScene, type SceneModule, type SceneOptions } from '../sceneTypes'
import { bridgeDefects, type BridgeDefect } from './bridgeData'
import { bridgeText as copy } from './bridgeCopy'

interface DefectVisual {
  definition: BridgeDefect
  point: THREE.Vector3
  normal: THREE.Vector3
  observer: THREE.Vector3
  marker: THREE.Group
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  pick: THREE.Mesh
}

function defectSurface(parent: THREE.Group, definition: BridgeDefect) {
  const surface = new THREE.Group()
  surface.position.fromArray(definition.point)
  surface.quaternion.setFromUnitVectors(v(0, 0, 1), v(...definition.normal))
  parent.add(surface)
  const [width, height] = definition.size
  if (definition.type === 'crack') {
    const crackMaterial = material(0x172a2c)
    const points = [
      v(-0.05, -0.48, 0.006),
      v(0.07, -0.3, 0.006),
      v(-0.06, -0.12, 0.006),
      v(0.09, 0.02, 0.006),
      v(-0.015, 0.18, 0.006),
      v(0.065, 0.37, 0.006),
      v(-0.01, 0.5, 0.006),
    ].map((point) => v(point.x * width * 2.3, point.y * height, point.z))
    mesh(
      surface,
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 28, 0.01, 5, false),
      crackMaterial,
    )
    mesh(
      surface,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          points[3],
          v(width * 0.23, height * 0.18, 0.007),
          v(width * 0.4, height * 0.22, 0.007),
        ]),
        10,
        0.007,
        4,
        false,
      ),
      crackMaterial,
    )
  } else {
    const outline = new THREE.Shape()
    const corners = [
      [-0.49, -0.25],
      [-0.3, -0.47],
      [-0.04, -0.36],
      [0.12, -0.48],
      [0.39, -0.32],
      [0.47, -0.06],
      [0.32, 0.11],
      [0.4, 0.36],
      [0.12, 0.46],
      [-0.16, 0.31],
      [-0.41, 0.42],
      [-0.34, 0.05],
    ]
    corners.forEach(([x, y], index) => {
      if (index === 0) outline.moveTo(x * width, y * height)
      else outline.lineTo(x * width, y * height)
    })
    outline.closePath()
    mesh(
      surface,
      new THREE.ShapeGeometry(outline),
      material(definition.type === 'spall' ? 0x526771 : 0x965337),
    )
    const inner = mesh(
      surface,
      new THREE.ShapeGeometry(outline),
      material(definition.type === 'spall' ? 0x2e4149 : 0xbb7543),
    )
    inner.scale.set(0.72, 0.71, 1)
    inner.position.set(width * 0.04, height * 0.025, 0.007)
    if (definition.type === 'spall') {
      for (const offset of [-0.16, 0.12]) {
        beam(
          surface,
          v(offset * width, -height * 0.29, 0.014),
          v(offset * width, height * 0.29, 0.014),
          0.009,
          material(0xa88566),
        )
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const flake = mesh(surface, new THREE.CircleGeometry(0.017 + (i % 2) * 0.012, 5), material(0x5a3430))
        flake.position.set((i - 2) * width * 0.135, Math.sin(i * 3.1) * height * 0.23, 0.012)
      }
    }
  }
  return surface
}

export function createBridgeScene(publish: PublishScene): SceneModule {
  const root = new THREE.Group()
  root.name = 'bridge-inspection-scene'
  const pickables: THREE.Object3D[] = []
  const bridgeBlockers: THREE.Object3D[] = []
  baseTile(root)

  const concrete = material(0x9badad)
  const concreteDark = material(0x5d7882)
  const steel = material(0x456776)
  const deckMaterial = material(0x243c48)
  const roadPaint = material(0xc9d8d4)
  const signalMaterial = new THREE.MeshBasicMaterial({ color: palette.mint })
  const water = mesh(root, new THREE.PlaneGeometry(21.95, 17.95), material(0x17526a, 0.88))
  water.rotation.x = -Math.PI / 2
  water.position.y = -0.25
  for (let i = 0; i < 14; i++) {
    const z = -8 + i * 1.2
    line(
      root,
      Array.from({ length: 30 }, (_, point) =>
        v(-10.6 + point * 0.73, -0.235, z + Math.sin(point * 0.55 + i) * 0.07),
      ),
      0x5b9cac,
      0.12,
    )
  }
  const structuralBox = (
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    mat = concrete,
  ) => {
    const object = box(root, width, height, depth, x, y, z, mat)
    bridgeBlockers.push(object)
    return object
  }
  structuralBox(21, 0.34, 2.46, 0, 2, 0, concreteDark)
  structuralBox(21, 0.025, 2.34, 0, 2.174, 0, deckMaterial)
  for (let x = -10.2; x < 10.5; x += 0.94) box(root, 0.43, 0.012, 0.035, x, 2.195, 0, roadPaint)
  for (const z of [-1.06, 1.06]) {
    line(root, [v(-10.5, 2.195, z), v(10.5, 2.195, z)], 0x8ca99e, 0.85)
    beam(root, v(-10.5, 2.46, z * 1.16), v(10.5, 2.46, z * 1.16), 0.023, steel)
    for (let x = -10.2; x <= 10.3; x += 0.6)
      beam(root, v(x, 2.19, z * 1.16), v(x, 2.46, z * 1.16), 0.013, steel)
  }
  for (const x of [-5.3, 5.3]) {
    structuralBox(1.2, 0.3, 3.2, x, -0.09, 0, concreteDark)
    structuralBox(0.62, 1.4, 1.8, x, 0.68, 0)
    structuralBox(1.06, 0.2, 2.16, x, 1.46, 0, concreteDark)
    structuralBox(0.9, 0.22, 2.02, x, 1.63, 0, steel)
    for (const z of [-1.36, 1.36]) {
      structuralBox(0.38, 5.0, 0.4, x, 4.13, z)
      for (const offset of [-4.6, -3.7, -2.8, -1.9, -1, 1, 1.9, 2.8, 3.7, 4.6]) {
        if (Math.abs(x + offset) <= 10.4)
          beam(root, v(x, 6.3 - Math.abs(offset) * 0.045, z), v(x + offset, 2.27, z * 0.88), 0.019, steel)
      }
    }
    structuralBox(0.47, 0.32, 3.13, x, 5.9, 0)
    structuralBox(0.46, 0.25, 3.1, x, 3.0, 0, concreteDark)
    for (const z of [-1.36, 1.36]) {
      const beacon = mesh(root, new THREE.SphereGeometry(0.053, 8, 6), signalMaterial)
      beacon.position.set(x, 6.7, z)
    }
  }
  for (const x of [-10.3, 10.3]) {
    structuralBox(1.3, 1.25, 3.4, x, 0.74, 0, concreteDark)
    structuralBox(1.45, 0.25, 3.65, x, 1.48, 0)
  }

  const startPosition = v(-9.4, 4.9, 4.1)
  const routePoints = [startPosition, ...bridgeDefects.map((definition) => v(...definition.observer))]
  // Explicit line segments match the drone's planned station-to-station travel.
  line(root, routePoints, palette.mint, 0.42)
  for (const point of routePoints.slice(1)) {
    const station = mesh(root, new THREE.SphereGeometry(0.055, 10, 6), signalMaterial)
    station.position.copy(point)
  }

  const defects: DefectVisual[] = bridgeDefects.map((definition) => {
    defectSurface(root, definition)
    const marker = new THREE.Group()
    marker.position.fromArray(definition.point).addScaledVector(v(...definition.normal), 0.045)
    marker.quaternion.setFromUnitVectors(v(0, 0, 1), v(...definition.normal))
    marker.visible = false
    root.add(marker)
    const ring = mesh(
      marker,
      new THREE.TorusGeometry(0.43, 0.015, 6, 40),
      new THREE.MeshBasicMaterial({ color: palette.amber }),
    ) as DefectVisual['ring']
    for (const x of [-1, 1])
      for (const y of [-1, 1]) {
        line(
          marker,
          [v(x * 0.52, y * 0.34, 0.005), v(x * 0.52, y * 0.5, 0.005), v(x * 0.36, y * 0.5, 0.005)],
          palette.amber,
          0.85,
        )
      }
    const pick = mesh(
      marker,
      new THREE.CircleGeometry(0.57, 20),
      new THREE.MeshBasicMaterial({
        color: palette.amber,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    )
    pick.userData.objectId = definition.id
    return {
      definition,
      point: v(...definition.point),
      normal: v(...definition.normal),
      observer: v(...definition.observer),
      marker,
      ring,
      pick,
    }
  })

  const drone = new THREE.Group()
  drone.name = 'inspection-drone'
  drone.position.copy(startPosition)
  root.add(drone)
  box(drone, 0.48, 0.14, 0.32, 0, 0, 0, material(0xdae9e5))
  box(drone, 0.23, 0.055, 0.24, 0, 0.095, 0, steel)
  const propellers: THREE.Mesh[] = []
  for (const x of [-0.4, 0.4])
    for (const z of [-0.4, 0.4]) {
      beam(drone, v(0, 0, 0), v(x, 0.015, z), 0.025, steel)
      const hub = mesh(drone, new THREE.CylinderGeometry(0.044, 0.044, 0.085, 8), steel)
      hub.position.set(x, 0.05, z)
      const rotor = mesh(drone, new THREE.BoxGeometry(0.44, 0.013, 0.039), material(0x9ce5d7, 0.8))
      rotor.position.set(x, 0.098, z)
      propellers.push(rotor)
      const disc = mesh(
        drone,
        new THREE.CylinderGeometry(0.22, 0.22, 0.006, 24),
        material(palette.mint, 0.09),
      )
      disc.position.set(x, 0.1, z)
    }
  for (const x of [-0.2, 0.2]) {
    beam(drone, v(x, -0.05, 0), v(x, -0.27, 0), 0.018, steel)
    beam(drone, v(x, -0.27, -0.21), v(x, -0.27, 0.21), 0.018, steel)
  }
  const gimbal = new THREE.Group()
  root.add(gimbal)
  const lens = mesh(gimbal, new THREE.CylinderGeometry(0.085, 0.065, 0.11, 14), material(0x121f2c))
  lens.rotation.x = Math.PI / 2
  const glass = mesh(gimbal, new THREE.CircleGeometry(0.058, 12), signalMaterial)
  glass.position.z = 0.061
  const scanGeometry = new THREE.BufferGeometry()
  const scanPositions = new Float32Array(12 * 3)
  scanGeometry.setAttribute('position', new THREE.BufferAttribute(scanPositions, 3))
  const scan = new THREE.Mesh(
    scanGeometry,
    new THREE.MeshBasicMaterial({
      color: palette.blue,
      transparent: true,
      opacity: 0.085,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  scan.frustumCulled = false
  scan.visible = false
  root.add(scan)
  const aimLine = line(root, [v(0, 0, 0), v(0, 0, 0)], palette.blue, 0.5)
  aimLine.visible = false
  const raycaster = new THREE.Raycaster()
  const forward = v(0, 0, 1)
  const discovered = new Set<string>()
  let nextStation = 0
  let dwell = 0
  let resetVersion = -1
  let manualProgress = 0
  let previousSnapshot = ''
  let phase: 'ready' | 'travel' | 'observe' | 'found' = 'ready'
  let activeDefect: DefectVisual | null = defects[0]

  const pointCamera = (defect: DefectVisual) => {
    gimbal.position.copy(drone.position).add(v(0, -0.16, 0))
    const direction = defect.point.clone().sub(gimbal.position).normalize()
    gimbal.quaternion.setFromUnitVectors(v(0, 0, 1), direction)
    forward.copy(direction)
  }

  const isObservable = (defect: DefectVisual) => {
    const fromCamera = defect.point.clone().sub(gimbal.position)
    const distance = fromCamera.length()
    if (distance > 3.55 || distance < 0.25) return false
    fromCamera.normalize()
    if (forward.dot(fromCamera) < Math.cos(THREE.MathUtils.degToRad(28))) return false
    if (defect.normal.dot(fromCamera.clone().negate()) < 0.35) return false
    root.updateMatrixWorld(true)
    raycaster.set(gimbal.position, fromCamera)
    raycaster.near = 0.02
    raycaster.far = Math.max(0.02, distance - 0.022)
    return raycaster.intersectObjects(bridgeBlockers, false).length === 0
  }

  const discover = (defect: DefectVisual) => {
    if (discovered.has(defect.definition.id) || !isObservable(defect)) return false
    discovered.add(defect.definition.id)
    defect.marker.visible = true
    pickables.push(defect.pick)
    phase = 'found'
    return true
  }

  const drawScan = (defect: DefectVisual, visible: boolean) => {
    scan.visible = visible
    aimLine.visible = visible
    if (!visible) return
    const basisX = v(1, 0, 0).applyQuaternion(defect.marker.quaternion)
    const basisY = v(0, 1, 0).applyQuaternion(defect.marker.quaternion)
    const center = defect.point.clone().addScaledVector(defect.normal, 0.015)
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([x, y]) =>
      center
        .clone()
        .addScaledVector(basisX, x * 0.48)
        .addScaledVector(basisY, y * 0.46),
    )
    let offset = 0
    for (let i = 0; i < 4; i++)
      for (const point of [gimbal.position, corners[i], corners[(i + 1) % 4]]) {
        scanPositions[offset++] = point.x
        scanPositions[offset++] = point.y
        scanPositions[offset++] = point.z
      }
    scanGeometry.attributes.position.needsUpdate = true
    const aimPosition = aimLine.geometry.attributes.position as THREE.BufferAttribute
    aimPosition.setXYZ(0, gimbal.position.x, gimbal.position.y, gimbal.position.z)
    aimPosition.setXYZ(1, center.x, center.y, center.z)
    aimPosition.needsUpdate = true
    aimLine.geometry.computeBoundingSphere()
  }

  const nextUnseen = (from: number) => {
    for (let offset = 0; offset < defects.length; offset++) {
      const index = (from + offset) % defects.length
      if (!discovered.has(defects[index].definition.id)) return index
    }
    return defects.length
  }

  const emit = (options: SceneOptions) => {
    const reviewedCount = defects.filter(
      ({ definition }) => discovered.has(definition.id) && options.reviewedIds.includes(definition.id),
    ).length
    let message: string = copy.initialShort
    if (reviewedCount === defects.length) message = copy.allReviewed
    else if (discovered.size === defects.length) message = copy.complete
    else if (options.paused && (discovered.size || phase !== 'ready')) message = copy.pausedMessage
    else if (phase === 'found') message = copy.foundMessage
    else if (options.mode !== 'process' && (discovered.size || phase !== 'ready')) message = copy.inspectMode
    else if (phase === 'travel') message = copy.flying
    else if (phase === 'observe') message = copy.observing
    const snapshot = {
      metrics: [
        { label: copy.points, value: defects.length },
        { label: copy.found, value: discovered.size },
        { label: copy.pendingCount, value: discovered.size - reviewedCount },
        { label: copy.reviewedCount, value: reviewedCount },
        { label: copy.bridgeLength, value: 21 * METERS_PER_UNIT, unit: 'm' },
      ],
      objects: defects.map(({ definition }) => {
        const found = discovered.has(definition.id)
        const reviewed = found && options.reviewedIds.includes(definition.id)
        return {
          id: definition.id,
          title: found ? definition.title : definition.checkpoint,
          subtitle: found ? definition.location : copy.waiting,
          status: !found
            ? ('undiscovered' as const)
            : reviewed
              ? ('reviewed' as const)
              : ('pending' as const),
          details: found
            ? [
                { label: copy.type, value: definition.typeLabel },
                { label: copy.location, value: definition.location },
                {
                  label: copy.coordinates,
                  value: `${definition.point.map((value) => (value * METERS_PER_UNIT).toFixed(1)).join(' / ')} m`,
                },
                { label: copy.evidence, value: copy.evidenceValue },
                { label: copy.status, value: reviewed ? copy.reviewed : copy.pending },
                { label: copy.scale, value: copy.scaleValue },
                { label: copy.data, value: copy.dataValue },
                { label: copy.note, value: definition.note },
              ]
            : [],
        }
      }),
      message,
      progress: (discovered.size / defects.length) * 100,
    }
    const signature = JSON.stringify(snapshot)
    if (signature !== previousSnapshot) {
      previousSnapshot = signature
      publish(snapshot)
    }
  }

  return {
    root,
    pickables,
    update(options, _time, delta) {
      if (options.resetVersion !== resetVersion) {
        const restoring = resetVersion === -1 && (options.discoveredIds?.length ?? 0) > 0
        resetVersion = options.resetVersion
        discovered.clear()
        pickables.splice(0)
        defects.forEach(({ marker }) => {
          marker.visible = false
        })
        drone.position.copy(startPosition)
        drone.rotation.set(0, 0, 0)
        nextStation = 0
        dwell = 0
        manualProgress = 0
        phase = 'ready'
        activeDefect = defects[0]
        if (restoring) {
          // Restore actual records, not a percentage: discovery order can differ
          // when automatic travel and the manual checkpoint action are combined.
          for (const defect of defects) {
            if (!options.discoveredIds?.includes(defect.definition.id)) continue
            discovered.add(defect.definition.id)
            defect.marker.visible = true
            pickables.push(defect.pick)
            activeDefect = defect
          }
          drone.position.copy(activeDefect.observer)
          pointCamera(activeDefect)
          nextStation = nextUnseen(0)
          manualProgress = options.progress
          phase = 'found'
        }
      }
      const requestedProgress = THREE.MathUtils.clamp(options.progress, 0, 100)
      if (requestedProgress !== manualProgress) {
        manualProgress = requestedProgress
        if (requestedProgress > 0) {
          const index = THREE.MathUtils.clamp(Math.ceil(requestedProgress / 25) - 1, 0, defects.length - 1)
          activeDefect = defects[index]
          drone.position.copy(activeDefect.observer)
          pointCamera(activeDefect)
          discover(activeDefect)
          nextStation = nextUnseen(index + 1)
          dwell = 0
        }
      }
      const step = options.paused || options.mode !== 'process' ? 0 : Math.max(0, Math.min(delta, 0.15))
      if (step > 0 && nextStation < defects.length) {
        const defect = defects[nextStation]
        activeDefect = defect
        const direction = defect.observer.clone().sub(drone.position)
        const distance = direction.length()
        const speed = (THREE.MathUtils.clamp(options.value, 20, 150) / 65) * 1.05
        if (distance > 0.035) {
          phase = 'travel'
          drone.position.addScaledVector(direction.normalize(), Math.min(distance, speed * step))
          drone.rotation.y = Math.atan2(direction.x, direction.z)
          dwell = 0
        } else {
          drone.position.copy(defect.observer)
          phase = 'observe'
          pointCamera(defect)
          dwell = isObservable(defect) ? dwell + step : 0
          if (dwell >= 0.85 && discover(defect)) {
            nextStation = nextUnseen(nextStation + 1)
            dwell = 0
          }
        }
        propellers.forEach((rotor, index) => {
          rotor.rotation.y += step * (index % 2 ? -30 : 30)
        })
      }
      if (activeDefect) {
        pointCamera(activeDefect)
        drawScan(activeDefect, drone.position.distanceTo(activeDefect.observer) < 0.08 && phase !== 'ready')
      }
      defects.forEach(({ definition, marker, ring }) => {
        const selected = options.selectedId === definition.id && discovered.has(definition.id)
        marker.scale.setScalar(selected ? 1.18 : 1)
        ring.material.color.set(
          options.reviewedIds.includes(definition.id)
            ? palette.mint
            : selected
              ? palette.white
              : palette.amber,
        )
      })
      emit(options)
    },
    focus(id) {
      const defect = defects.find(({ definition }) => definition.id === id)
      if (!defect || !discovered.has(id)) return null
      return { position: v(...defect.definition.focusPosition), target: defect.point.clone() }
    },
  }
}
