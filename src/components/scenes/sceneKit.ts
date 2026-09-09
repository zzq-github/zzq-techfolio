import * as THREE from 'three'

export const palette = {
  mint: 0x76ebcf,
  amber: 0xffbd67,
  blue: 0x57a9dc,
  red: 0xed8a71,
  white: 0xc6e5e8,
  dark: 0x183749,
}
export const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
export const material = (color: number, opacity = 1) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.66,
    metalness: 0.12,
    transparent: opacity < 1,
    opacity,
  })
export function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material) {
  const object = new THREE.Mesh(geometry, mat)
  parent.add(object)
  return object
}
export function box(
  parent: THREE.Object3D,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
) {
  const object = mesh(parent, new THREE.BoxGeometry(width, height, depth), mat)
  object.position.set(x, y, z)
  return object
}
export function beam(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  mat: THREE.Material,
) {
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 8), mat)
  object.position.copy(a).add(b).multiplyScalar(0.5)
  object.quaternion.setFromUnitVectors(v(0, 1, 0), b.clone().sub(a).normalize())
  return object
}
export function line(parent: THREE.Object3D, points: THREE.Vector3[], color = palette.mint, opacity = 0.6) {
  const object = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  )
  parent.add(object)
  return object
}
export function baseTile(parent: THREE.Object3D) {
  box(parent, 22.2, 0.45, 18.2, 0, -0.6, 0, material(0x142c36))
  const grid = new THREE.GridHelper(32, 32, 0x264954, 0x15313c)
  grid.position.y = -0.88
  parent.add(grid)
  line(
    parent,
    [
      v(-11.1, -0.36, -9.1),
      v(11.1, -0.36, -9.1),
      v(11.1, -0.36, 9.1),
      v(-11.1, -0.36, 9.1),
      v(-11.1, -0.36, -9.1),
    ],
    palette.mint,
    0.5,
  )
}
