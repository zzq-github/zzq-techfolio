import * as THREE from 'three'
import { baseTile, beam, box, line, material, mesh, palette, v } from '../sceneKit'
import type { PublishScene, SceneModule } from '../sceneTypes'

export function createWindScene(publish: PublishScene): SceneModule {
  const root = new THREE.Group()
  baseTile(root)
  const white = material(palette.white),
    dark = material(palette.dark),
    amber = material(palette.amber)
  white.roughness = 0.46
  const steel = material(0x577986)
  const signal = new THREE.MeshBasicMaterial({ color: palette.mint })
  const waterMaterial = material(0x125174, 0.86)
  waterMaterial.roughness = 0.3
  waterMaterial.metalness = 0.22
  const water = mesh(root, new THREE.PlaneGeometry(22, 18, 48, 40), waterMaterial)
  water.geometry.rotateX(-Math.PI / 2)
  water.position.y = -0.12

  // Broad shoulders, swept tips and a subtle twist restore an airfoil silhouette.
  // A single geometry is shared by all 27 blades.
  const profile = new THREE.Shape()
  profile.moveTo(-0.063, 0.11)
  profile.quadraticCurveTo(-0.17, 0.32, -0.155, 0.6)
  profile.quadraticCurveTo(-0.08, 1.38, 0.045, 1.99)
  profile.quadraticCurveTo(0.075, 2.025, 0.103, 1.91)
  profile.quadraticCurveTo(0.18, 1.03, 0.15, 0.51)
  profile.quadraticCurveTo(0.12, 0.24, 0.063, 0.11)
  profile.closePath()
  const bladeGeometry = new THREE.ExtrudeGeometry(profile, {
    depth: 0.045,
    bevelEnabled: true,
    bevelSize: 0.006,
    bevelThickness: 0.006,
    bevelSegments: 1,
    curveSegments: 10,
  })
  bladeGeometry.translate(0, 0, -0.0225)
  const bladePositions = bladeGeometry.attributes.position
  for (let i = 0; i < bladePositions.count; i++) {
    const x = bladePositions.getX(i)
    const y = bladePositions.getY(i)
    const z = bladePositions.getZ(i)
    const fraction = THREE.MathUtils.clamp(y / 2, 0, 1)
    const twist = (1 - fraction) * 0.32
    bladePositions.setXYZ(
      i,
      x * Math.cos(twist) + z * Math.sin(twist),
      y,
      -x * Math.sin(twist) + z * Math.cos(twist) + fraction ** 2 * 0.04,
    )
  }
  bladeGeometry.computeVertexNormals()

  const rotors: THREE.Group[] = []
  for (let row = -1; row <= 1; row++)
    for (let col = -1; col <= 1; col++) {
      const x = col * 6,
        z = row * 5
      const tower = mesh(root, new THREE.CylinderGeometry(0.1, 0.23, 4.4, 18), white)
      tower.position.set(x, 2.1, z)
      box(root, 0.43, 0.37, 0.81, x, 4.35, z, white)
      box(root, 0.3, 0.16, 0.024, x, 4.34, z - 0.418, dark)
      for (const offset of [-0.08, 0, 0.08]) {
        box(root, 0.021, 0.12, 0.028, x + offset, 4.34, z - 0.439, steel)
      }
      const foundation = mesh(root, new THREE.CylinderGeometry(0.28, 0.33, 0.86, 18), amber)
      foundation.position.set(x, 0.2, z)
      const platform = mesh(root, new THREE.CylinderGeometry(0.44, 0.44, 0.06, 24), steel)
      platform.position.set(x, 0.64, z)
      const guardrail = mesh(root, new THREE.TorusGeometry(0.414, 0.011, 5, 30), white)
      guardrail.rotation.x = Math.PI / 2
      guardrail.position.set(x, 0.86, z)
      for (let post = 0; post < 6; post++) {
        const angle = (post / 6) * Math.PI * 2
        const px = x + Math.cos(angle) * 0.414
        const pz = z + Math.sin(angle) * 0.414
        beam(root, v(px, 0.67, pz), v(px, 0.86, pz), 0.009, white)
      }
      for (const y of [1.55, 2.95]) {
        const radius = 0.23 - ((y + 0.1) / 4.4) * 0.13
        const joint = mesh(root, new THREE.TorusGeometry(radius + 0.003, 0.007, 4, 22), steel)
        joint.rotation.x = Math.PI / 2
        joint.position.set(x, y, z)
      }
      const rotor = new THREE.Group()
      rotor.position.set(x, 4.35, z + 0.5)
      rotor.name = `wind-rotor-${row + 1}-${col + 1}`
      root.add(rotor)
      const hub = mesh(rotor, new THREE.SphereGeometry(0.18, 14, 10), white)
      hub.position.z = 0.05
      hub.scale.z = 1.24
      for (let i = 0; i < 3; i++) {
        const blade = mesh(rotor, bladeGeometry, white)
        blade.rotation.z = (i * Math.PI * 2) / 3
      }
      rotor.rotation.z = (row + col) * 0.5
      rotors.push(rotor)
      line(root, [v(x, -0.22, z), v(x, -0.22, 7), v(8, -0.22, 7)], palette.mint, 0.7)
    }

  // Compact offshore substation: jacket legs, deck, switchgear and roof lights.
  for (const x of [7.18, 8.82])
    for (const z of [6.3, 7.7]) {
      beam(root, v(x, -0.34, z), v(x, 0.57, z), 0.085, amber)
    }
  for (const z of [6.3, 7.7]) {
    beam(root, v(7.18, -0.26, z), v(8.82, 0.52, z), 0.028, steel)
    beam(root, v(8.82, -0.26, z), v(7.18, 0.52, z), 0.028, steel)
  }
  box(root, 2.1, 0.12, 1.9, 8, 0.6, 7, steel)
  box(root, 1.3, 0.8, 1.4, 8, 1.06, 7, dark)
  box(root, 1.5, 0.08, 1.6, 8, 1.5, 7, signal)
  for (const x of [7.67, 8.0, 8.33]) {
    box(root, 0.23, 0.19, 0.025, x, 1.19, 7.715, white)
    box(root, 0.23, 0.17, 0.32, x, 1.625, 7.13, steel)
  }
  for (const x of [7.1, 8.9]) {
    beam(root, v(x, 0.67, 6.16), v(x, 0.97, 6.16), 0.018, white)
    beam(root, v(x, 0.67, 7.84), v(x, 0.97, 7.84), 0.018, white)
    beam(root, v(x, 0.97, 6.16), v(x, 0.97, 7.84), 0.015, white)
  }
  beam(root, v(7.1, 0.97, 6.16), v(8.9, 0.97, 6.16), 0.015, white)
  beam(root, v(7.1, 0.97, 7.84), v(8.9, 0.97, 7.84), 0.015, white)

  let previous = -1
  let lastWaveTime: number | null = null
  return {
    root,
    pickables: [],
    update(options, time, delta) {
      const step = options.paused ? 0 : delta
      rotors.forEach((rotor) => {
        rotor.rotation.z -= step * options.value * 0.12
      })
      if (lastWaveTime === null || (!options.paused && time !== lastWaveTime)) {
        lastWaveTime = time
        const position = water.geometry.attributes.position
        const normal = water.geometry.attributes.normal
        for (let i = 0; i < position.count; i++) {
          const phaseX = position.getX(i) * 1.6 + time * 0.8
          const phaseZ = position.getZ(i) * 1.3 + time * 0.4
          position.setY(i, Math.sin(phaseX) * Math.cos(phaseZ) * 0.065)
          const nx = -Math.cos(phaseX) * Math.cos(phaseZ) * 0.104
          const nz = Math.sin(phaseX) * Math.sin(phaseZ) * 0.0845
          const length = Math.hypot(nx, 1, nz)
          normal.setXYZ(i, nx / length, 1 / length, nz / length)
        }
        position.needsUpdate = true
        normal.needsUpdate = true
      }
      if (previous !== options.value) {
        previous = options.value
        publish({
          metrics: [
            { label: '风机数量', value: 9, unit: '台' },
            { label: '模拟风速', value: options.value, unit: 'm/s' },
          ],
          objects: [],
          message: '风场为本地合成，叶片转速仅作视觉表达。',
        })
      }
    },
  }
}
