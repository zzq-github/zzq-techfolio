import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { SceneKind } from './sceneData'

export interface SceneOptions {
  value: number
  paused: boolean
  interactive: boolean
}
export interface SceneController {
  update: (options: SceneOptions) => void
  camera: (action: 'left' | 'right' | 'in' | 'out' | 'reset') => void
  dispose: () => void
}

// All dimensions are illustrative local units; no real project assets or telemetry.
export function createScene(
  host: HTMLElement,
  kind: SceneKind,
  initial: SceneOptions,
  onLost: () => void,
): SceneController {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x07131d, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x07131d, 0.017)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 160)
  camera.position.set(19, 17, 24)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1, 0)
  controls.enablePan = false
  controls.enableZoom = false // Keep normal page scrolling; zoom uses accessible buttons.
  controls.minDistance = 17
  controls.maxDistance = 55
  controls.minPolarAngle = 0.22
  controls.maxPolarAngle = Math.PI * 0.47
  controls.autoRotateSpeed = 0.35
  controls.update()
  controls.saveState()
  scene.add(new THREE.HemisphereLight(0xb6e9ff, 0x173f47, 2.8))
  const key = new THREE.DirectionalLight(0xd9ffef, 3.5)
  key.position.set(8, 18, 10)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x379cff, 3)
  rim.position.set(-12, 6, -10)
  scene.add(rim)
  const world = new THREE.Group()
  scene.add(world)
  const mint = 0x76ebcf,
    amber = 0xffbd67
  const material = (color: number, opacity = 1) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.25,
      transparent: opacity < 1,
      opacity,
    })
  const bodyMat = material(0x739bab)
  const lightMat = material(0xc6e5e8)
  const darkMat = material(0x183749)
  const signalMat = new THREE.MeshBasicMaterial({ color: mint })
  const alertMat = new THREE.MeshBasicMaterial({ color: amber })
  // Shared materials that may not be used in every scene are disposed explicitly below.
  const sharedMaterials = [bodyMat, lightMat, darkMat, signalMat, alertMat]
  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = world) {
    const object = new THREE.Mesh(geometry, mat)
    parent.add(object)
    return object
  }
  function box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material = bodyMat,
    parent: THREE.Object3D = world,
  ) {
    const object = mesh(new THREE.BoxGeometry(w, h, d), mat, parent)
    object.position.set(x, y, z)
    return object
  }
  function line(points: THREE.Vector3[], color = mint, opacity = 0.6, parent: THREE.Object3D = world) {
    const object = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    )
    parent.add(object)
    return object
  }
  function beam(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D = world,
  ) {
    const object = mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 6), mat, parent)
    object.position.copy(a).add(b).multiplyScalar(0.5)
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
    return object
  }
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  box(22, 0.5, 18, 0, -0.65, 0, darkMat)
  const grid = new THREE.GridHelper(34, 34, 0x265568, 0x13333f)
  grid.position.y = -0.94
  world.add(grid)
  line([v(-11, -0.36, -9), v(11, -0.36, -9), v(11, -0.36, 9), v(-11, -0.36, 9), v(-11, -0.36, -9)], mint, 0.7)
  const updates: ((time: number, delta: number, value: number) => void)[] = []

  function terrain(height: (x: number, z: number) => number) {
    const geometry = new THREE.PlaneGeometry(22, 18, 88, 72)
    geometry.rotateX(-Math.PI / 2)
    const position = geometry.attributes.position
    const colors = []
    const low = new THREE.Color(0x103f4b),
      high = new THREE.Color(0x7cae87)
    for (let i = 0; i < position.count; i++) {
      const y = height(position.getX(i), position.getZ(i))
      position.setY(i, y)
      const color = low.clone().lerp(high, THREE.MathUtils.clamp(y / 4, 0, 1))
      colors.push(color.r, color.g, color.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    const group = new THREE.Group()
    world.add(group)
    mesh(
      geometry,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide }),
      group,
    )
    const wire = new THREE.WireframeGeometry(geometry)
    const lattice = new THREE.LineSegments(
      wire,
      new THREE.LineBasicMaterial({ color: mint, transparent: true, opacity: 0.095 }),
    )
    group.add(lattice)
    // Close the heightfield edges so the terrain reads as a solid survey tile.
    const perimeter: THREE.Vector3[] = []
    for (let i = 0; i < 88; i++) perimeter.push(v(-11 + (i / 88) * 22, 0, -9))
    for (let i = 0; i < 72; i++) perimeter.push(v(11, 0, -9 + (i / 72) * 18))
    for (let i = 0; i < 88; i++) perimeter.push(v(11 - (i / 88) * 22, 0, 9))
    for (let i = 0; i < 72; i++) perimeter.push(v(-11, 0, 9 - (i / 72) * 18))
    const sides: number[] = []
    perimeter.forEach((a, i) => {
      const b = perimeter[(i + 1) % perimeter.length]
      const ay = height(a.x, a.z),
        by = height(b.x, b.z)
      sides.push(a.x, ay, a.z, a.x, -0.4, a.z, b.x, by, b.z, b.x, by, b.z, a.x, -0.4, a.z, b.x, -0.4, b.z)
    })
    const skirt = new THREE.BufferGeometry()
    skirt.setAttribute('position', new THREE.Float32BufferAttribute(sides, 3))
    skirt.computeVertexNormals()
    mesh(
      skirt,
      new THREE.MeshStandardMaterial({ color: 0x183c48, roughness: 0.9, side: THREE.DoubleSide }),
      group,
    )
    return group
  }
  function ocean(width = 22, depth = 18, y = -0.12) {
    const geometry = new THREE.PlaneGeometry(width, depth, 48, 40)
    geometry.rotateX(-Math.PI / 2)
    const water = mesh(geometry, material(0x125174, 0.83))
    water.position.y = y
    const position = geometry.attributes.position
    updates.push((time) => {
      for (let i = 0; i < position.count; i++) {
        position.setY(
          i,
          Math.sin(position.getX(i) * 1.6 + time * 0.8) *
            Math.cos(position.getZ(i) * 1.3 + time * 0.4) *
            0.065,
        )
      }
      position.needsUpdate = true
      geometry.computeVertexNormals()
    })
    return water
  }
  if (kind === 'earthwork') {
    const height = (x: number, z: number) =>
      0.3 +
      3.5 * Math.exp(-((x + 3) ** 2 / 20 + (z + 2) ** 2 / 18)) +
      2.8 * Math.exp(-((x - 6) ** 2 / 13 + (z - 3) ** 2 / 14)) +
      0.22 * Math.sin(x * 0.8) * Math.cos(z * 0.7)
    const land = terrain(height)
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: 128 }, (_, i) => {
        const a = (i / 128) * Math.PI * 2
        const x = Math.cos(a) * 8,
          z = Math.sin(a) * 5.5
        return v(x, height(x, z) + 0.2, z)
      }),
      true,
    )
    line(path.getPoints(220), amber, 0.95, land)
    const trucks = Array.from({ length: 3 }, () => {
      const truck = new THREE.Group()
      land.add(truck)
      box(0.62, 0.22, 0.32, 0, 0.19, 0, lightMat, truck)
      box(0.37, 0.16, 0.3, -0.11, 0.38, 0, alertMat, truck)
      return truck
    })
    for (const [x, z] of [
      [-3, -2],
      [6, 3],
    ]) {
      const y = height(x, z)
      beam(v(x, y, z), v(x, y + 1.3, z), 0.025, signalMat, land)
      const marker = mesh(new THREE.OctahedronGeometry(0.17), alertMat, land)
      marker.position.set(x, y + 1.4, z)
    }
    updates.push((time, _delta, value) => {
      land.scale.y = value / 100
      trucks.forEach((truck, i) => {
        const t = (time * 0.025 + i / 3) % 1
        truck.position.copy(path.getPointAt(t))
        const tangent = path.getTangentAt(t)
        truck.rotation.y = -Math.atan2(tangent.z, tangent.x)
      })
    })
  } else if (kind === 'uav') {
    ocean()
    box(21, 0.3, 2.4, 0, 2, 0, darkMat)
    for (const z of [-1.2, 1.2]) line([v(-10.5, 2.2, z), v(10.5, 2.2, z)], mint, 0.9)
    for (let x = -10; x < 10; x += 1.1) box(0.5, 0.012, 0.035, x, 2.16, 0, lightMat)
    for (const x of [-5.3, 5.3]) {
      for (const z of [-1.35, 1.35]) {
        box(0.36, 6.7, 0.36, x, 3, z, lightMat)
        for (let offset = -4; offset <= 4; offset += 1) {
          if (offset) beam(v(x, 6.2, z), v(x + offset, 2.2, z * 0.82), 0.023, bodyMat)
        }
      }
      box(0.5, 0.32, 3, x, 5.7, 0, lightMat)
    }
    const path = new THREE.CatmullRomCurve3(
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return v(Math.cos(a) * 8.6, 4.4 + Math.sin(a * 2) * 0.9, Math.sin(a) * 4)
      }),
      true,
    )
    line(path.getPoints(160), mint, 0.7)
    const drone = new THREE.Group()
    world.add(drone)
    box(0.45, 0.15, 0.35, 0, 0, 0, lightMat, drone)
    for (const x of [-0.42, 0.42])
      for (const z of [-0.42, 0.42]) {
        beam(v(0, 0, 0), v(x, 0, z), 0.03, bodyMat, drone)
        const rotor = mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.025, 20), material(mint, 0.55), drone)
        rotor.position.set(x, 0.05, z)
      }
    const cone = mesh(
      new THREE.ConeGeometry(1.1, 2.7, 28, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x4dafff,
        opacity: 0.12,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      drone,
    )
    cone.position.y = -1.45
    const marker = mesh(new THREE.TorusGeometry(0.3, 0.055, 8, 32), alertMat)
    marker.position.set(2, 2.35, 1.3)
    let progress = 0
    updates.push((_time, delta, value) => {
      progress = (progress + (delta * value) / 2600) % 1
      drone.position.copy(path.getPointAt(progress))
      const tangent = path.getTangentAt(progress)
      drone.rotation.y = -Math.atan2(tangent.z, tangent.x)
    })
  } else if (kind === 'offshore-wind') {
    ocean()
    const rotors: THREE.Group[] = []
    for (let row = -1; row <= 1; row++)
      for (let col = -1; col <= 1; col++) {
        const x = col * 6,
          z = row * 5
        const tower = mesh(new THREE.CylinderGeometry(0.1, 0.23, 4.4, 12), lightMat)
        tower.position.set(x, 2.1, z)
        box(0.42, 0.37, 0.78, x, 4.35, z, lightMat)
        const foundation = mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.9, 12), alertMat)
        foundation.position.set(x, 0.25, z)
        const rotor = new THREE.Group()
        rotor.position.set(x, 4.35, z + 0.5)
        world.add(rotor)
        const hub = mesh(new THREE.SphereGeometry(0.18, 12, 8), lightMat, rotor)
        hub.position.z = 0.05
        for (let i = 0; i < 3; i++) {
          const shape = new THREE.Shape()
          shape.moveTo(-0.07, 0.08)
          shape.lineTo(-0.15, 0.6)
          shape.lineTo(0.025, 1.95)
          shape.lineTo(0.12, 1.85)
          shape.lineTo(0.15, 0.5)
          shape.closePath()
          const blade = mesh(
            new THREE.ExtrudeGeometry(shape, { depth: 0.045, bevelEnabled: false }),
            lightMat,
            rotor,
          )
          blade.rotation.z = (i * Math.PI * 2) / 3
        }
        rotor.rotation.z = (row + col) * 0.5
        rotors.push(rotor)
        line([v(x, 0.08, z), v(x, 0.08, 7), v(8, 0.08, 7)], mint, 0.6)
      }
    box(1.3, 0.8, 1.4, 8, 0.8, 7, darkMat)
    box(1.5, 0.08, 1.6, 8, 1.24, 7, signalMat)
    updates.push((_time, delta, value) =>
      rotors.forEach((rotor) => {
        rotor.rotation.z -= delta * value * 0.12
      }),
    )
  } else {
    const height = (x: number, z: number) =>
      0.1 + Math.pow(Math.abs(x) / 3.5, 1.4) * (0.7 + 0.22 * Math.cos(z * 0.65)) + 0.12 * Math.sin(x + z)
    terrain(height)
    const water = ocean(21.8, 17.8)
    for (let x = -4; x <= 4; x++) box(0.85, 1.5, 0.55, x, 0.7, 3.5, bodyMat)
    box(9, 0.16, 0.8, 0, 1.52, 3.5, lightMat)
    for (const x of [-6, 6]) {
      const z = -2,
        y = height(x, z)
      beam(v(x, y, z), v(x, y + 1, z), 0.035, alertMat)
      const marker = mesh(new THREE.OctahedronGeometry(0.2), alertMat)
      marker.position.set(x, y + 1, z)
    }
    updates.push((_time, _delta, value) => {
      water.position.y = (value / 100) * 2.5
    })
  }

  let options = initial,
    visible = false,
    frame = 0,
    last = 0,
    time = 0,
    disposed = false
  const render = (delta: number) => {
    if (!options.paused) time += delta
    updates.forEach((update) => update(time, options.paused ? 0 : delta, options.value))
    controls.autoRotate = !options.paused && !options.interactive
    controls.enabled = options.interactive
    controls.update(delta)
    renderer.render(scene, camera)
  }
  const tick = (now: number) => {
    frame = 0
    if (disposed || !visible || document.hidden) return
    if (now - last >= 1000 / 30) {
      render(last ? Math.min((now - last) / 1000, 0.08) : 0)
      last = now
    }
    if (!options.paused) frame = requestAnimationFrame(tick)
  }
  const wake = () => {
    if (disposed || !visible || document.hidden) return
    last = 0
    render(0)
    if (!options.paused && !frame) frame = requestAnimationFrame(tick)
  }
  const onChange = () => {
    if (options.paused && visible && !document.hidden) renderer.render(scene, camera)
  }
  controls.addEventListener('change', onChange)
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) * Math.max(1, 1.45 / camera.aspect)),
    )
    camera.updateProjectionMatrix()
    wake()
  })
  resize.observe(host)
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) wake()
    else {
      cancelAnimationFrame(frame)
      frame = 0
    }
  })
  observer.observe(host)
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame)
      frame = 0
    } else wake()
  }
  document.addEventListener('visibilitychange', visibility)
  const contextLost = (event: Event) => {
    event.preventDefault()
    cancelAnimationFrame(frame)
    frame = 0
    onLost()
  }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  return {
    update(next) {
      options = next
      wake()
    },
    camera(action) {
      if (action === 'reset') controls.reset()
      else if (action === 'left' || action === 'right') {
        const relative = camera.position.clone().sub(controls.target)
        relative.applyAxisAngle(v(0, 1, 0), action === 'left' ? -0.25 : 0.25)
        camera.position.copy(controls.target).add(relative)
      } else {
        const relative = camera.position.clone().sub(controls.target)
        relative.setLength(THREE.MathUtils.clamp(relative.length() * (action === 'in' ? 0.85 : 1.18), 17, 55))
        camera.position.copy(controls.target).add(relative)
      }
      wake()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      controls.removeEventListener('change', onChange)
      controls.dispose()
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>(sharedMaterials)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          for (const mat of Array.isArray(object.material) ? object.material : [object.material])
            materials.add(mat)
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((mat) => mat.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
