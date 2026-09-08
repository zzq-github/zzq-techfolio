import { useEffect, useRef, useState } from 'react'
import { metrics } from '../../data/profile'
import { Reveal } from '../common/Reveal'

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduceMotion) {
          setDisplay(value)
        } else {
          const startedAt = performance.now()
          const tick = (time: number) => {
            const progress = Math.min((time - startedAt) / 900, 1)
            setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))))
            if (progress < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        }
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref}>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
    </span>
  )
}

export function About() {
  return (
    <section className="section metrics-section" aria-label="职业数据概览">
      <Reveal>
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <article className="metric-card" key={metric.label}>
              <span className="metric-index">0{index + 1}</span>
              <strong>
                {typeof metric.value === 'number' ? (
                  <Counter value={metric.value} suffix={metric.suffix} />
                ) : (
                  metric.value
                )}
              </strong>
              <h3>{metric.label}</h3>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
