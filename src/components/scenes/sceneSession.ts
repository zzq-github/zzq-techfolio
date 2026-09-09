import { sceneDefinitions, type SceneKind } from './sceneData'
import type { SceneOptions } from './sceneTypes'

// React owns the session; switching scenes can release WebGL without discarding work.
export interface SceneSession extends SceneOptions {
  autoProcess: boolean
  filter: string
  discoveredIds: string[]
}

export const defaultMode = (kind: SceneKind): SceneOptions['mode'] =>
  kind === 'earthwork' || kind === 'water-twin' ? 'analysis' : 'overview'

export function createSceneSession(kind: SceneKind): SceneSession {
  return {
    value: sceneDefinitions[kind].initial,
    paused: false,
    interactive: false,
    mode: defaultMode(kind),
    progress: 0,
    autoProcess: false,
    filter: 'all',
    showOriginal: false,
    selectedId: null,
    reviewedIds: [],
    discoveredIds: [],
    showBuildings: true,
    showRoads: true,
    showGreenery: true,
    xray: false,
    resetVersion: 0,
  }
}
