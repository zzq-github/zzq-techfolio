import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { SceneKind } from './sceneData'
import type { SceneModule, SceneOptions, PublishScene } from './sceneTypes'
import { createEarthworkScene } from './modules/earthworkScene'
import { createWaterScene } from './modules/waterScene'
import { createBridgeScene } from './modules/bridgeScene'
import { createCampusScene } from './modules/campusScene'
import { createWindScene } from './modules/windScene'
export type { SceneOptions } from './sceneTypes'

export interface SceneController {
  update: (options: SceneOptions) => void
  camera: (action: 'left' | 'right' | 'in' | 'out' | 'reset') => void
  select: (id: string) => void
  dispose: () => void
}

const factories: Record<SceneKind, (publish: PublishScene) => SceneModule> = {
  earthwork: createEarthworkScene,
  uav: createBridgeScene,
  'water-twin': createWaterScene,
  'offshore-wind': createWindScene,
  campus: createCampusScene,
}

export function createScene(
  host: HTMLElement,
  kind: SceneKind,
  initial: SceneOptions,
  onLost: () => void,
  publish: PublishScene,
  onSelect: (id: string) => void,
): SceneController {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x07131d)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.localClippingEnabled = true
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x07131d, 0.008)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150)
  camera.position.set(19, 17, 24)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enabled = initial.interactive
  renderer.domElement.style.touchAction = initial.interactive ? 'none' : 'pan-y'
  controls.target.set(0, 1, 0)
  controls.enablePan = false
  controls.enableZoom = false
  controls.minDistance = 3
  controls.maxDistance = 55
  controls.minPolarAngle = 0.12
  controls.maxPolarAngle = Math.PI * 0.49
  controls.autoRotateSpeed = 0.25
  controls.update()
  controls.saveState()
  scene.add(new THREE.HemisphereLight(0xc8ebf5, 0x233e44, 2))
  const key = new THREE.DirectionalLight(0xe3ffeb, kind === 'campus' ? 1.25 : 2.6)
  key.position.set(-8, 18, 12)
  const rim = new THREE.DirectionalLight(0x689cc7, 1.8)
  rim.position.set(10, 8, -12)
  scene.add(key, rim)
  const module = factories[kind](publish)
  scene.add(module.root)
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let options = initial,
    disposed = false,
    visible = false,
    time = 0,
    last = 0,
    frame = 0
  let focusTransition: {
    fromPosition: THREE.Vector3
    fromTarget: THREE.Vector3
    position: THREE.Vector3
    target: THREE.Vector3
    elapsed: number
  } | null = null

  const render = (delta: number) => {
    const moving = !options.paused && !motion.matches
    if (moving) time += delta
    module.update(options, time, moving ? delta : 0)
    controls.enabled = options.interactive
    renderer.domElement.style.touchAction = options.interactive ? 'none' : 'pan-y'
    controls.autoRotate = moving && !options.interactive && !options.selectedId && options.mode === 'overview'
    if (focusTransition) {
      focusTransition.elapsed += delta
      const t = Math.min(1, focusTransition.elapsed / 0.65)
      const ease = 1 - (1 - t) ** 3
      camera.position.lerpVectors(focusTransition.fromPosition, focusTransition.position, ease)
      controls.target.lerpVectors(focusTransition.fromTarget, focusTransition.target, ease)
      if (t === 1) focusTransition = null
    }
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
    if ((!options.paused && !motion.matches) || focusTransition) frame = requestAnimationFrame(tick)
  }
  const wake = () => {
    if (disposed || !visible || document.hidden) return
    last = 0
    render(0)
    if (((!options.paused && !motion.matches) || focusTransition) && !frame)
      frame = requestAnimationFrame(tick)
  }
  const onChange = () => {
    if (options.paused && visible && !document.hidden && !disposed) renderer.render(scene, camera)
  }
  controls.addEventListener('change', onChange)
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) wake()
    else {
      cancelAnimationFrame(frame)
      frame = 0
    }
  })
  observer.observe(host)
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height || disposed) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) * Math.max(1, 1.15 / camera.aspect)),
    )
    camera.updateProjectionMatrix()
    wake()
  })
  resize.observe(host)
  const visibility = () => {
    cancelAnimationFrame(frame)
    frame = 0
    wake()
  }
  document.addEventListener('visibilitychange', visibility)
  motion.addEventListener('change', visibility)
  const lost = (event: Event) => {
    event.preventDefault()
    onLost()
  }
  renderer.domElement.addEventListener('webglcontextlost', lost)

  const pointerStart = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const pointerDown = (event: PointerEvent) => pointerStart.set(event.clientX, event.clientY)
  const isVisible = (object: THREE.Object3D): boolean =>
    object.visible && (!object.parent || isVisible(object.parent))
  const pointerUp = (event: PointerEvent) => {
    if (disposed || pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 6) return
    const bounds = host.getBoundingClientRect()
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster
      .intersectObjects(module.pickables.filter(isVisible), true)
      .find((item) => isVisible(item.object))
    let object: THREE.Object3D | null = hit?.object ?? null
    while (object && !object.userData.objectId) object = object.parent
    if (object?.userData.objectId) onSelect(String(object.userData.objectId))
  }
  renderer.domElement.addEventListener('pointerdown', pointerDown)
  renderer.domElement.addEventListener('pointerup', pointerUp)

  return {
    update(next) {
      options = next
      controls.enabled = options.interactive
      renderer.domElement.style.touchAction = options.interactive ? 'none' : 'pan-y'
      // Parameter calculations must still update the mobile panel below an offscreen canvas.
      if (!visible || document.hidden) module.update(options, time, 0)
      wake()
    },
    select(id) {
      const view = module.focus?.(id)
      if (!view) return
      if (motion.matches) {
        camera.position.copy(view.position)
        controls.target.copy(view.target)
      } else
        focusTransition = {
          fromPosition: camera.position.clone(),
          fromTarget: controls.target.clone(),
          ...view,
          elapsed: 0,
        }
      wake()
    },
    camera(action) {
      focusTransition = null
      if (action === 'reset') controls.reset()
      else {
        const relative = camera.position.clone().sub(controls.target)
        if (action === 'left' || action === 'right')
          relative.applyAxisAngle(new THREE.Vector3(0, 1, 0), action === 'left' ? -0.25 : 0.25)
        else
          relative.setLength(
            THREE.MathUtils.clamp(relative.length() * (action === 'in' ? 0.85 : 1.18), 3, 55),
          )
        camera.position.copy(controls.target).add(relative)
      }
      wake()
    },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      motion.removeEventListener('change', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointerup', pointerUp)
      controls.removeEventListener('change', onChange)
      controls.dispose()
      module.dispose?.()
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>()
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
