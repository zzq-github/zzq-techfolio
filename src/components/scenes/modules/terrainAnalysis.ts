/** Regular, cell-centred raster. All dimensions and heights are in metres. */
export interface TerrainGrid {
  columns: number
  rows: number
  cellSizeMeters: number
  heights: ArrayLike<number>
}

export interface EarthworkResult {
  cutVolume: number
  fillVolume: number
  netVolume: number
  area: number
}

export interface FloodResult {
  flooded: Uint8Array
  depths: Float32Array
  area: number
  volume: number
  maximumDepth: number
}

function validateGrid(grid: TerrainGrid) {
  const { columns, rows, cellSizeMeters, heights } = grid
  if (
    !Number.isInteger(columns) ||
    !Number.isInteger(rows) ||
    columns < 1 ||
    rows < 1 ||
    !Number.isFinite(cellSizeMeters) ||
    cellSizeMeters <= 0 ||
    heights.length !== columns * rows
  ) {
    throw new RangeError('Invalid terrain grid dimensions')
  }
  for (let i = 0; i < heights.length; i++) {
    if (!Number.isFinite(heights[i])) throw new RangeError('Terrain heights must be finite')
  }
}

/** Cell-centre integration; no vertical visual exaggeration enters this calculation. */
export function calculateEarthwork(
  grid: TerrainGrid,
  designElevationMeters: number | ArrayLike<number>,
  mask?: ArrayLike<number>,
): EarthworkResult {
  validateGrid(grid)
  const count = grid.heights.length
  if (
    (typeof designElevationMeters !== 'number' && designElevationMeters.length !== count) ||
    (mask && mask.length !== count)
  )
    throw new RangeError('Mismatched earthwork raster')
  const cellArea = grid.cellSizeMeters ** 2
  let cutVolume = 0,
    fillVolume = 0,
    area = 0
  for (let i = 0; i < count; i++) {
    if (mask && !mask[i]) continue
    const target =
      typeof designElevationMeters === 'number' ? designElevationMeters : designElevationMeters[i]
    if (!Number.isFinite(target)) throw new RangeError('Design elevations must be finite')
    const difference = grid.heights[i] - target
    cutVolume += Math.max(0, difference) * cellArea
    fillVolume += Math.max(0, -difference) * cellArea
    area += cellArea
  }
  return { cutVolume, fillVolume, netVolume: cutVolume - fillVolume, area }
}

/**
 * Static, four-neighbour connected inundation from explicit water-source cells.
 * barrierCrests contains effective obstacle crest elevations, in metres. A cell
 * becomes traversable only when water is above both its ground and its crest.
 * This is a terrain connectivity calculation, not a hydrodynamic simulation.
 */
export function calculateConnectedFlood(
  grid: TerrainGrid,
  waterLevelMeters: number,
  sourceIndices: readonly number[],
  barrierCrests?: ArrayLike<number>,
): FloodResult {
  validateGrid(grid)
  const count = grid.heights.length
  if (!Number.isFinite(waterLevelMeters) || (barrierCrests && barrierCrests.length !== count)) {
    throw new RangeError('Invalid flood inputs')
  }
  if (barrierCrests) {
    for (let i = 0; i < count; i++) {
      if (Number.isNaN(barrierCrests[i])) throw new RangeError('Barrier crests cannot be NaN')
    }
  }
  const flooded = new Uint8Array(count)
  const depths = new Float32Array(count)
  const queue = new Int32Array(count)
  let head = 0,
    tail = 0,
    volume = 0,
    maximumDepth = 0
  const canEnter = (index: number) => {
    const crest = barrierCrests?.[index] ?? -Infinity
    return !flooded[index] && grid.heights[index] < waterLevelMeters && crest < waterLevelMeters
  }
  const visit = (index: number) => {
    if (!canEnter(index)) return
    flooded[index] = 1
    queue[tail++] = index
  }
  for (const source of sourceIndices) {
    if (!Number.isInteger(source) || source < 0 || source >= count)
      throw new RangeError('Invalid water source')
    visit(source)
  }
  while (head < tail) {
    const index = queue[head++]
    const depth = waterLevelMeters - Math.max(grid.heights[index], barrierCrests?.[index] ?? -Infinity)
    depths[index] = depth
    volume += depth * grid.cellSizeMeters ** 2
    maximumDepth = Math.max(maximumDepth, depth)
    const column = index % grid.columns
    if (column > 0) visit(index - 1)
    if (column < grid.columns - 1) visit(index + 1)
    if (index >= grid.columns) visit(index - grid.columns)
    if (index < count - grid.columns) visit(index + grid.columns)
  }
  return { flooded, depths, area: tail * grid.cellSizeMeters ** 2, volume, maximumDepth }
}
