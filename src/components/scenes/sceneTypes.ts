import type * as THREE from 'three'

export interface SceneOptions {
  value: number
  paused: boolean
  interactive: boolean
  mode: 'overview' | 'analysis' | 'process'
  progress: number
  showOriginal: boolean
  selectedId: string | null
  reviewedIds: string[]
  showBuildings: boolean
  showRoads: boolean
  showGreenery: boolean
  xray: boolean
  resetVersion: number
}

export interface SceneObject {
  id: string
  title: string
  subtitle: string
  status: 'normal' | 'undiscovered' | 'pending' | 'reviewed' | 'affected'
  details: { label: string; value: string }[]
}

export interface SceneSnapshot {
  metrics: { label: string; value: number | string; unit?: string }[]
  objects: SceneObject[]
  message?: string
  progress?: number
}

export interface SceneModule {
  root: THREE.Group
  pickables: THREE.Object3D[]
  update: (options: SceneOptions, time: number, delta: number) => void
  focus?: (id: string) => { position: THREE.Vector3; target: THREE.Vector3 } | null
  dispose?: () => void
}

export type PublishScene = (snapshot: SceneSnapshot) => void
export const METERS_PER_UNIT = 10
