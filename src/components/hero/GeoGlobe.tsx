import { useEffect, useRef } from 'react'

type Vector = [number, number, number]
type Ring = number[][]
type Polygon = Ring[]
type LandData = {
  features: { geometry: { type: string; coordinates: Polygon | Polygon[] } | null }[]
}
const RAD = Math.PI / 180
const vector = (longitude: number, latitude: number): Vector => {
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
function prepareLand(data: LandData) {
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
const grid: Vector[][] = []
for (let latitude = -60; latitude <= 60; latitude += 20)
  grid.push(Array.from({ length: 181 }, (_, i) => vector(i * 2 - 180, latitude)))
for (let longitude = -180; longitude < 180; longitude += 30)
  grid.push(Array.from({ length: 91 }, (_, i) => vector(longitude, i * 2 - 90)))
const orbits = [-25, 48].map((tilt, index) =>
  Array.from({ length: 241 }, (_, i): Vector => {
    const t = (i / 240) * Math.PI * 2,
      x = Math.cos(t) * (1.3 + index * 0.05),
      y = Math.sin(t) * 0.43
    return [
      x * Math.cos(tilt * RAD) - y * Math.sin(tilt * RAD),
      x * Math.sin(tilt * RAD) + y * Math.cos(tilt * RAD),
      Math.sin(t),
    ]
  }),
)

export function GeoGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return
    const controller = new AbortController()
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const latitude = 22 * RAD,
      sinLatitude = Math.sin(latitude),
      cosLatitude = Math.cos(latitude)
    let width = 0,
      height = 0,
      radius = 0,
      centerX = 0,
      centerY = 0
    let angle = 112.9 * RAD,
      frame = 0,
      last = 0,
      inView = true,
      disposed = false
    let land: ReturnType<typeof prepareLand> = { points: [], coasts: [] }
    let surface: CanvasGradient, glow: CanvasGradient

    const draw = () => {
      if (!width || !height || disposed) return
      const sin = Math.sin(angle),
        cos = Math.cos(angle)
      const project = ([x, y, z]: Vector): Vector => {
        const depth = x * sin + z * cos
        return [
          x * cos - z * sin,
          y * cosLatitude - depth * sinLatitude,
          y * sinLatitude + depth * cosLatitude,
        ]
      }
      context.clearRect(0, 0, width, height)
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)
      const orbit = (front: boolean) => {
        context.beginPath()
        for (const ring of orbits) {
          let drawing = false
          for (const [x, y, z] of ring) {
            if (z >= 0 !== front) {
              drawing = false
              continue
            }
            if (drawing) context.lineTo(centerX + x * radius, centerY + y * radius)
            else context.moveTo(centerX + x * radius, centerY + y * radius)
            drawing = true
          }
        }
        context.lineWidth = front ? 0.9 : 0.65
        context.strokeStyle = front ? 'rgba(106, 224, 218, .38)' : 'rgba(84, 164, 177, .18)'
        context.stroke()
      }
      orbit(false)
      context.beginPath()
      context.arc(centerX, centerY, radius, 0, Math.PI * 2)
      context.fillStyle = surface
      context.fill()
      context.strokeStyle = 'rgba(103, 228, 223, .3)'
      context.lineWidth = 1
      context.stroke()

      const lines = (paths: Vector[][], color: string, lineWidth: number) => {
        context.beginPath()
        for (const path of paths) {
          let previous: Vector | undefined
          for (const point of path) {
            const current = project(point)
            const [x, y, z] = current
            if (previous && previous[2] >= 0 !== z >= 0) {
              const t = previous[2] / (previous[2] - z)
              const edgeX = centerX + (previous[0] + (x - previous[0]) * t) * radius
              const edgeY = centerY - (previous[1] + (y - previous[1]) * t) * radius
              if (z >= 0) context.moveTo(edgeX, edgeY)
              else context.lineTo(edgeX, edgeY)
            }
            if (z >= 0) {
              if (!previous) context.moveTo(centerX + x * radius, centerY - y * radius)
              else context.lineTo(centerX + x * radius, centerY - y * radius)
            }
            previous = current
          }
        }
        context.strokeStyle = color
        context.lineWidth = lineWidth
        context.stroke()
      }
      lines(grid, 'rgba(72, 145, 155, .2)', 0.6)
      lines(land.coasts, 'rgba(115, 242, 213, .52)', 0.75)
      context.fillStyle = '#80efd0'
      for (const point of land.points) {
        const depth = point[0] * sin + point[2] * cos
        const z = point[1] * sinLatitude + depth * cosLatitude
        if (z < 0.015) continue
        const x = centerX + (point[0] * cos - point[2] * sin) * radius
        const y = centerY - (point[1] * cosLatitude - depth * sinLatitude) * radius
        const size = Math.max(0.7, radius / 215) * (0.65 + z * 0.35)
        context.globalAlpha = 0.15 + z * 0.65
        context.fillRect(x - size / 2, y - size / 2, size, size)
      }
      context.globalAlpha = 1
      orbit(true)
      const [nodeX, nodeY, nodeZ] = project(vector(112.9388, 28.2282))
      if (nodeZ > 0) {
        const x = centerX + nodeX * radius,
          y = centerY - nodeY * radius
        context.beginPath()
        context.arc(x, y, 8, 0, Math.PI * 2)
        context.strokeStyle = `rgba(125, 255, 209, ${nodeZ * 0.5})`
        context.lineWidth = 1
        context.stroke()
        context.beginPath()
        context.arc(x, y, 3, 0, Math.PI * 2)
        context.fillStyle = '#c0ffe3'
        context.shadowColor = '#66ffd0'
        context.shadowBlur = 14
        context.fill()
        context.shadowBlur = 0
      }
    }
    const tick = (now: number) => {
      const elapsed = now - last
      if (elapsed >= 1000 / 24) {
        angle += Math.min(elapsed, 100) * 0.000018
        last = now - (elapsed % (1000 / 24))
        draw()
      }
      frame = requestAnimationFrame(tick)
    }
    const syncPlayback = () => {
      cancelAnimationFrame(frame)
      frame = 0
      draw()
      if (!disposed && inView && !document.hidden && !motion.matches) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }
    const resize = () => {
      const bounds = canvas.getBoundingClientRect(),
        dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      radius = Math.min(width, height) * 0.335
      centerX = width * 0.51
      centerY = height * 0.5
      surface = context.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.45,
        0,
        centerX,
        centerY,
        radius,
      )
      surface.addColorStop(0, '#0b2730')
      surface.addColorStop(0.7, '#06171f')
      surface.addColorStop(1, '#071d27')
      glow = context.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius * 1.5)
      glow.addColorStop(0, 'rgba(49, 169, 168, .12)')
      glow.addColorStop(0.5, 'rgba(34, 124, 143, .045)')
      glow.addColorStop(1, 'rgba(34, 124, 143, 0)')
      draw()
    }
    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        syncPlayback()
      },
      { threshold: 0 },
    )
    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    motion.addEventListener('change', syncPlayback)
    document.addEventListener('visibilitychange', syncPlayback)
    resize()
    syncPlayback()
    fetch(`${import.meta.env.BASE_URL}data/land-110m.geojson`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Land geometry unavailable')
        return response.json() as Promise<LandData>
      })
      .then((data) => {
        if (!disposed) {
          land = prepareLand(data)
          draw()
        }
      })
      .catch(() => {
        /* Keep the graticule visible if the local data cannot load. */
      })
    return () => {
      disposed = true
      controller.abort()
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      motion.removeEventListener('change', syncPlayback)
      document.removeEventListener('visibilitychange', syncPlayback)
    }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      className="globe-canvas"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
