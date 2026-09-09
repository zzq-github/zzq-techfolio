import * as THREE from 'three'
import { prepareLand, type LandData } from './globeLand'

export interface GlobeController {
  setPaused: (paused: boolean) => void
  reset: () => void
  dispose: () => void
}

const RAD = Math.PI / 180
const HOME_LONGITUDE = -(112.9388 + 90) * RAD
const location = (longitude: number, latitude: number, radius = 1) =>
  new THREE.Vector3(
    Math.cos(latitude * RAD) * Math.cos(longitude * RAD),
    Math.sin(latitude * RAD),
    -Math.cos(latitude * RAD) * Math.sin(longitude * RAD),
  ).multiplyScalar(radius)

// The same local coastline powers the surface, outlines and raised land samples.
function surfaceTexture(data: LandData, width: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = width / 2
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#102c3b'
  ctx.fillRect(0, 0, width, width / 2)
  ctx.fillStyle = '#4b8884'
  for (const { geometry } of data.features) {
    if (!geometry) continue
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    for (const polygon of polygons as number[][][][]) {
      ctx.beginPath()
      for (const ring of polygon) {
        ring.forEach(([lon, lat], index) => {
          const x = ((lon + 180) / 360) * width
          const y = ((90 - lat) / 180) * canvas.height
          if (index === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
      }
      ctx.fill('evenodd')
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createGlobe(
  host: HTMLElement,
  label: HTMLElement,
  callbacks: { onReady: () => void; onUnavailable: () => void },
): GlobeController {
  const compact = window.matchMedia('(max-width: 767px)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !compact,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x060b10, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.domElement.className = 'globe-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
  camera.position.z = 4.75
  const rig = new THREE.Group()
  const earth = new THREE.Group()
  earth.rotation.set(22 * RAD, HOME_LONGITUDE, -6 * RAD, 'XYZ')
  rig.add(earth)
  scene.add(rig)
  scene.add(new THREE.AmbientLight(0x699dad, 0.55))
  const key = new THREE.DirectionalLight(0xdcfff1, 3.6)
  key.position.set(-3.5, 4, 3)
  const rim = new THREE.DirectionalLight(0x559cff, 2.2)
  rim.position.set(3, 0.5, -2)
  scene.add(key, rim)

  const globeGeometry = new THREE.SphereGeometry(1, compact ? 64 : 96, compact ? 40 : 64)
  const globeMaterial = new THREE.MeshStandardMaterial({
    color: 0x102c3b,
    roughness: 0.72,
    metalness: 0.12,
  })
  earth.add(new THREE.Mesh(globeGeometry, globeMaterial))

  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: { strength: { value: 0.68 }, tint: { value: new THREE.Color('#71e9d6') } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform float strength;
      uniform vec3 tint;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        float edge = pow(1.0 - max(dot(n, normalize(vView)), 0.0), 3.8);
        float light = 0.35 + 0.65 * max(dot(n, normalize(vec3(-0.6, 0.8, 0.5))), 0.0);
        gl_FragColor = vec4(tint, edge * light * strength);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const atmosphere = new THREE.Mesh(globeGeometry, atmosphereMaterial)
  atmosphere.scale.setScalar(1.024)
  rig.add(atmosphere)
  const haloMaterial = atmosphereMaterial.clone()
  haloMaterial.uniforms.strength.value = 0.16
  const halo = new THREE.Mesh(globeGeometry, haloMaterial)
  halo.scale.setScalar(1.075)
  rig.add(halo)

  function lines(points: THREE.Vector3[], color: number, opacity: number, parent = earth) {
    const result = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
    )
    parent.add(result)
    return result
  }
  const grid: THREE.Vector3[] = []
  for (let lat = -60; lat <= 60; lat += 30)
    for (let lon = -180; lon < 180; lon += 3)
      grid.push(location(lon, lat, 1.002), location(lon + 3, lat, 1.002))
  for (let lon = -180; lon < 180; lon += 30)
    for (let lat = -90; lat < 90; lat += 3)
      grid.push(location(lon, lat, 1.002), location(lon, lat + 3, 1.002))
  lines(grid, 0x8ebbbc, 0.13)

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 193 }, (_, i) => {
      const t = (i / 192) * Math.PI * 2
      return new THREE.Vector3(Math.cos(t), Math.sin(t), 0)
    }),
  )
  const orbits = [
    { radius: 1.24, x: 1.05, z: -0.42, color: 0x76dace, speed: 0.2 },
    { radius: 1.36, x: 1.22, z: 0.84, color: 0x729fc3, speed: -0.14 },
  ].map((spec, index) => {
    const orbit = new THREE.Group()
    orbit.rotation.set(spec.x, 0.15, spec.z)
    const line = new THREE.Line(
      orbitGeometry,
      new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: index === 0 ? 0.38 : 0.22,
      }),
    )
    line.scale.setScalar(spec.radius)
    orbit.add(line)
    const bead = new THREE.Mesh(
      new THREE.SphereGeometry(index === 0 ? 0.013 : 0.009, 12, 8),
      new THREE.MeshBasicMaterial({ color: index === 0 ? 0xc6fff0 : 0x9dccff }),
    )
    orbit.add(bead)
    const trailPoints = new Float32Array(30 * 3)
    const trailColors = new Float32Array(30 * 3)
    const color = new THREE.Color(spec.color)
    for (let i = 0; i < 30; i++) {
      const alpha = (1 - i / 30) * 0.75
      trailColors.set([color.r * alpha, color.g * alpha, color.b * alpha], i * 3)
    }
    const trailGeometry = new THREE.BufferGeometry()
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPoints, 3))
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3))
    const trail = new THREE.Line(
      trailGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    )
    // The line moves around its fixed bounding sphere; do not cull stale bounds.
    trail.frustumCulled = false
    orbit.add(trail)
    rig.add(orbit)
    return { ...spec, bead, trail, phase: index * 2.7 + 0.8 }
  })

  const originPosition = location(112.9388, 28.2282, 1.018)
  const origin = new THREE.Group()
  origin.position.copy(originPosition)
  origin.lookAt(originPosition.clone().multiplyScalar(2))
  const originDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.013, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd8a2 }),
  )
  const originRing = new THREE.Mesh(
    new THREE.RingGeometry(0.024, 0.029, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd09a,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  origin.add(originDot, originRing)
  earth.add(origin)

  let width = 0,
    height = 0,
    frame = 0,
    last = 0,
    time = 0
  let paused = false,
    inView = true,
    disposed = false
  const pointer = new THREE.Vector2()
  const worldOrigin = new THREE.Vector3()
  const projectedOrigin = new THREE.Vector3()
  const fetchController = new AbortController()
  const textures: THREE.Texture[] = []

  const draw = () => {
    if (disposed || !width || !height) return
    for (const orbit of orbits) {
      const phase = orbit.phase + time * orbit.speed
      orbit.bead.position.set(Math.cos(phase) * orbit.radius, Math.sin(phase) * orbit.radius, 0)
      const position = orbit.trail.geometry.getAttribute('position')
      for (let i = 0; i < position.count; i++) {
        const angle = phase - Math.sign(orbit.speed) * i * 0.009
        position.setXYZ(i, Math.cos(angle) * orbit.radius, Math.sin(angle) * orbit.radius, 0)
      }
      position.needsUpdate = true
    }
    const pulse = reduced.matches ? 1 : 1 + Math.sin(time * 1.5) * 0.15
    originRing.scale.setScalar(pulse)
    renderer.render(scene, camera)
    origin.getWorldPosition(worldOrigin)
    projectedOrigin.copy(worldOrigin).project(camera)
    // A point on the rear hemisphere must not leave a floating location label.
    const visible = worldOrigin.dot(camera.position.clone().sub(worldOrigin)) > 0.12
    label.style.visibility = visible ? 'visible' : 'hidden'
    label.style.transform = `translate(${(projectedOrigin.x * 0.5 + 0.5) * width}px, ${(-projectedOrigin.y * 0.5 + 0.5) * height}px)`
  }

  const tick = (now: number) => {
    if (disposed) return
    if (now - last >= 1000 / 30) {
      const delta = Math.min((now - last) / 1000, 0.08)
      last = now
      time += delta
      earth.rotation.y += delta * 0.026
      rig.rotation.x += (pointer.y * 0.035 - rig.rotation.x) * 0.08
      rig.rotation.y += (pointer.x * 0.065 - rig.rotation.y) * 0.08
      draw()
    }
    frame = requestAnimationFrame(tick)
  }
  const syncPlayback = () => {
    cancelAnimationFrame(frame)
    frame = 0
    const playing = !paused && !reduced.matches && inView && !document.hidden && !disposed
    host.dataset.playback = playing ? 'playing' : 'paused'
    if (reduced.matches) {
      pointer.set(0, 0)
      rig.rotation.set(0, 0, 0)
    }
    if (inView && !document.hidden) draw()
    if (playing) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }
  const resize = () => {
    const bounds = host.getBoundingClientRect()
    width = bounds.width
    height = bounds.height
    if (!width || !height || disposed) return
    camera.aspect = width / height
    camera.position.z = camera.aspect < 1 ? 4.75 / camera.aspect : 4.75
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    draw()
  }
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || reduced.matches || paused) return
    const bounds = host.getBoundingClientRect()
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
    )
  }
  const leave = () => pointer.set(0, 0)
  const lost = (event: Event) => {
    event.preventDefault()
    callbacks.onUnavailable()
  }
  const interactionHost = host.closest('.spatial-scene') ?? host
  interactionHost.addEventListener('pointermove', move as EventListener)
  interactionHost.addEventListener('pointerleave', leave)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    syncPlayback()
  })
  resizeObserver.observe(host)
  intersectionObserver.observe(host)
  document.addEventListener('visibilitychange', syncPlayback)
  reduced.addEventListener('change', syncPlayback)
  resize()
  syncPlayback()

  void fetch(`${import.meta.env.BASE_URL}data/land-110m.geojson`, { signal: fetchController.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Land geometry unavailable')
      return response.json() as Promise<LandData>
    })
    .then((data) => {
      if (disposed) return
      const texture = surfaceTexture(data, compact ? 1024 : 2048)
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
      textures.push(texture)
      globeMaterial.map = texture
      globeMaterial.color.set(0xffffff)
      globeMaterial.needsUpdate = true
      const land = prepareLand(data)
      const coasts: THREE.Vector3[] = []
      for (const path of land.coasts) {
        for (let i = 1; i < path.length; i++) {
          for (const [x, y, z] of [path[i - 1], path[i]])
            coasts.push(new THREE.Vector3(z, y, -x).multiplyScalar(1.004))
        }
      }
      lines(coasts, 0xa1e7d4, 0.32)
      const samples = land.points
        .filter((_, i) => !compact || i % 2 === 0)
        .map(([x, y, z]) => new THREE.Vector3(z, y, -x).multiplyScalar(1.008))
      const dots = new THREE.Points(
        new THREE.BufferGeometry().setFromPoints(samples),
        new THREE.PointsMaterial({
          color: 0xb4efdb,
          size: compact ? 0.009 : 0.007,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
      )
      earth.add(dots)
      draw()
      callbacks.onReady()
    })
    .catch(() => {
      // A failed map request still leaves a complete lit globe and graticule.
      if (!disposed) {
        draw()
        callbacks.onReady()
      }
    })

  return {
    setPaused(value) {
      paused = value
      syncPlayback()
    },
    reset() {
      earth.rotation.set(22 * RAD, HOME_LONGITUDE, -6 * RAD)
      rig.rotation.set(0, 0, 0)
      pointer.set(0, 0)
      time = 0
      draw()
    },
    dispose() {
      if (disposed) return
      disposed = true
      fetchController.abort()
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      reduced.removeEventListener('change', syncPlayback)
      document.removeEventListener('visibilitychange', syncPlayback)
      interactionHost.removeEventListener('pointermove', move as EventListener)
      interactionHost.removeEventListener('pointerleave', leave)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach((material) => materials.add(material))
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
      label.style.visibility = 'hidden'
    },
  }
}
