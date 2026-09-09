import { bridgeText as copy } from './bridgeCopy'

export interface BridgeDefect {
  id: string
  checkpoint: string
  title: string
  type: 'crack' | 'spall' | 'rust'
  typeLabel: string
  location: string
  note: string
  point: [number, number, number]
  normal: [number, number, number]
  observer: [number, number, number]
  focusPosition: [number, number, number]
  size: [number, number]
}

// One local unit is 10 m. Defect graphics are deliberately enlarged and are not measurements.
export const bridgeDefects: readonly BridgeDefect[] = [
  {
    id: 'bridge-deck-crack',
    checkpoint: copy.point1,
    title: copy.deckCrack,
    type: 'crack',
    typeLabel: copy.crack,
    location: copy.deckLocation,
    note: copy.deckNote,
    point: [-7.3, 2.199, 0.45],
    normal: [0, 1, 0],
    observer: [-7.3, 4.65, 2.3],
    focusPosition: [-8.9, 4.8, 3.6],
    size: [0.75, 0.55],
  },
  {
    id: 'bridge-girder-spall',
    checkpoint: copy.point2,
    title: copy.girderSpall,
    type: 'spall',
    typeLabel: copy.spall,
    location: copy.girderLocation,
    note: copy.girderNote,
    point: [-2.4, 1.97, 1.235],
    normal: [0, 0, 1],
    observer: [-2.4, 2.9, 4.2],
    focusPosition: [-3.8, 3.0, 4.4],
    size: [0.65, 0.24],
  },
  {
    id: 'bridge-tower-crack',
    checkpoint: copy.point3,
    title: copy.towerCrack,
    type: 'crack',
    typeLabel: copy.crack,
    location: copy.towerLocation,
    note: copy.towerNote,
    point: [5.3, 4.25, 1.565],
    normal: [0, 0, 1],
    observer: [5.3, 4.4, 4.5],
    focusPosition: [6.8, 4.9, 4.2],
    size: [0.29, 0.85],
  },
  {
    id: 'bridge-bearing-rust',
    checkpoint: copy.point4,
    title: copy.bearingRust,
    type: 'rust',
    typeLabel: copy.rust,
    location: copy.bearingLocation,
    note: copy.bearingNote,
    point: [5.3, 1.585, 1.018],
    normal: [0, 0, 1],
    observer: [5.3, 1.38, 4.0],
    focusPosition: [6.8, 1.95, 4.0],
    size: [0.58, 0.11],
  },
]
