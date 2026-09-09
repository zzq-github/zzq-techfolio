import { expect, test } from '@playwright/test'
import {
  calculateConnectedFlood,
  calculateEarthwork,
  type TerrainGrid,
} from '../src/components/scenes/modules/terrainAnalysis'

test('earthwork integrates metre elevations over square-metre cell areas', () => {
  const grid: TerrainGrid = {
    columns: 2,
    rows: 2,
    cellSizeMeters: 2,
    heights: new Float32Array([4, 1, 3, 2]),
  }

  // A two-metre cell has 4 m² area: cut depths 2 + 1, fill depth 1.
  expect(calculateEarthwork(grid, 2)).toEqual({
    cutVolume: 12,
    fillVolume: 4,
    netVolume: 8,
    area: 16,
  })
  expect(calculateEarthwork({ ...grid, cellSizeMeters: 4 }, 2)).toEqual({
    cutVolume: 48,
    fillVolume: 16,
    netVolume: 32,
    area: 64,
  })
})

test('earthwork honours a construction mask and per-cell graded design elevations', () => {
  const grid: TerrainGrid = {
    columns: 2,
    rows: 2,
    cellSizeMeters: 2,
    heights: [4, 1, 30, 2],
  }
  const result = calculateEarthwork(grid, [2, 2, 0, 4], new Uint8Array([1, 1, 0, 1]))

  // The high third cell is outside the work boundary and contributes nothing.
  expect(result).toEqual({ cutVolume: 8, fillVolume: 12, netVolume: -4, area: 12 })
  expect(calculateEarthwork(grid, 2, new Uint8Array(4))).toEqual({
    cutVolume: 0,
    fillVolume: 0,
    netVolume: 0,
    area: 0,
  })
})

test('flood connectivity cannot cross diagonal corners or wrap across raster rows', () => {
  const diagonal: TerrainGrid = {
    columns: 2,
    rows: 2,
    cellSizeMeters: 1,
    heights: [0, 8, 8, 0],
  }
  const isolated = calculateConnectedFlood(diagonal, 1, [0])
  expect(Array.from(isolated.flooded)).toEqual([1, 0, 0, 0])
  expect(Array.from(isolated.depths)).toEqual([1, 0, 0, 0])
  expect(isolated.area).toBe(1)

  const rowBoundary: TerrainGrid = {
    columns: 3,
    rows: 2,
    cellSizeMeters: 1,
    heights: [8, 8, 0, 0, 8, 8],
  }
  expect(Array.from(calculateConnectedFlood(rowBoundary, 1, [2]).flooded)).toEqual([0, 0, 1, 0, 0, 0])
})

test('a dam blocks connectivity at its crest and connects both banks only above it', () => {
  const grid: TerrainGrid = {
    columns: 5,
    rows: 3,
    cellSizeMeters: 1,
    heights: new Float32Array(15),
  }
  const crests = new Float32Array(15).fill(-Infinity)
  for (const cell of [2, 7, 12]) crests[cell] = 4

  const held = calculateConnectedFlood(grid, 4, [0], crests)
  expect(held.area).toBe(6)
  expect(held.flooded[2]).toBe(0)
  expect(held.flooded[4]).toBe(0)

  const overtopped = calculateConnectedFlood(grid, 4.1, [0], crests)
  expect(overtopped.area).toBe(15)
  expect(overtopped.flooded[4]).toBe(1)
  expect(overtopped.depths[2]).toBeCloseTo(0.1, 5)

  const drySource = calculateConnectedFlood(grid, 0, [0], crests)
  expect(drySource.area).toBe(0)
  expect(drySource.volume).toBe(0)
})

test('flood depth and volume account for solid obstacles without double-counting sources', () => {
  const grid: TerrainGrid = {
    columns: 3,
    rows: 1,
    cellSizeMeters: 2,
    heights: [0, 0, 0],
  }
  const result = calculateConnectedFlood(grid, 5, [0, 0, 2], [-Infinity, 4, -Infinity])

  // The middle cell has only 1 m of water above a 4 m obstacle, not 5 m.
  expect(Array.from(result.flooded)).toEqual([1, 1, 1])
  expect(Array.from(result.depths)).toEqual([5, 1, 5])
  expect(result.area).toBe(12)
  expect(result.volume).toBe(44)
  expect(result.maximumDepth).toBe(5)
})

test('invalid grid, design, source and barrier inputs fail explicitly', () => {
  const grid: TerrainGrid = { columns: 2, rows: 1, cellSizeMeters: 1, heights: [0, 1] }
  const invalidCalls = [
    () => calculateEarthwork({ ...grid, columns: 1.5 }, 2),
    () => calculateEarthwork({ ...grid, cellSizeMeters: 0 }, 2),
    () => calculateEarthwork({ ...grid, heights: [0] }, 2),
    () => calculateEarthwork({ ...grid, heights: [0, NaN] }, 2),
    () => calculateEarthwork(grid, Infinity),
    () => calculateEarthwork(grid, [2]),
    () => calculateEarthwork(grid, 2, [1]),
    () => calculateConnectedFlood(grid, Infinity, [0]),
    () => calculateConnectedFlood(grid, 2, [-1]),
    () => calculateConnectedFlood(grid, 2, [2]),
    () => calculateConnectedFlood(grid, 2, [0.5]),
    () => calculateConnectedFlood(grid, 2, [0], [4]),
    () => calculateConnectedFlood(grid, 2, [0], [NaN, -Infinity]),
  ]
  for (const calculate of invalidCalls) expect(calculate).toThrow(RangeError)
})
