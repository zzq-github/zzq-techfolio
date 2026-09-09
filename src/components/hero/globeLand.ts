export type Vector = [number, number, number]
type Ring = number[][]
type Polygon = Ring[]
export type LandData = {
  features: { geometry: { type: string; coordinates: Polygon | Polygon[] } | null }[]
}
export const RAD = Math.PI / 180
export const vector = (longitude: number, latitude: number): Vector => {
  const latitudeRadians = latitude * RAD
  return [
    Math.cos(latitudeRadians) * Math.sin(longitude * RAD),
    Math.sin(latitudeRadians),
    Math.cos(latitudeRadians) * Math.cos(longitude * RAD),
  ]
}
const inside = (x: number, y: number, ring: Ring) => {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i],
      b = ring[j]
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit
  }
  return hit
}
export function prepareLand(data: LandData) {
  const polygons = data.features.flatMap(({ geometry }) =>
    !geometry
      ? []
      : geometry.type === 'Polygon'
        ? [geometry.coordinates as Polygon]
        : geometry.type === 'MultiPolygon'
          ? (geometry.coordinates as Polygon[])
          : [],
  )
  const regions = polygons
    .filter((polygon) => polygon[0]?.length)
    .map((polygon) => ({
      polygon,
      bounds: polygon[0].reduce(
        (bounds, [x, y]) => [
          Math.min(bounds[0], x),
          Math.min(bounds[1], y),
          Math.max(bounds[2], x),
          Math.max(bounds[3], y),
        ],
        [180, 90, -180, -90],
      ),
    }))
  const points: Vector[] = []
  for (let latitude = -80; latitude < 84; latitude += 2) {
    const step = 2 / Math.cos(latitude * RAD)
    for (let longitude = -180; longitude < 180; longitude += step) {
      if (
        regions.some(
          ({ polygon, bounds }) =>
            longitude >= bounds[0] &&
            longitude <= bounds[2] &&
            latitude >= bounds[1] &&
            latitude <= bounds[3] &&
            inside(longitude, latitude, polygon[0]) &&
            !polygon.slice(1).some((ring) => inside(longitude, latitude, ring)),
        )
      )
        points.push(vector(longitude, latitude))
    }
  }
  return {
    points,
    coasts: polygons.flatMap((polygon) => polygon.map((ring) => ring.map(([x, y]) => vector(x, y)))),
  }
}
