import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useMotionPreference } from '../../hooks/useMotionPreference'
import { usePreferences } from '../../preferences/context'
import { siteConfig } from '../../config/site'
import { GlobeFallback } from './GlobeFallback'
import type { GlobeController } from './globeEngine'

export function GeoGlobe() {
  const { t } = usePreferences()
  const reduced = useMotionPreference()
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<GlobeController | null>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const label = labelRef.current
    if (!host || !label || !siteConfig.enableThreeGlobe) return
    let disposed = false
    let started = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        observer.disconnect()
        // Keep the readable first frame while the shared Three.js chunk loads.
        void import('./globeEngine')
          .then(({ createGlobe }) => {
            if (disposed) return
            controllerRef.current = createGlobe(host, label, {
              onReady: () => {
                if (!disposed) setReady(true)
              },
              onUnavailable: () => {
                if (disposed) return
                controllerRef.current?.dispose()
                controllerRef.current = null
                setReady(false)
              },
            })
          })
          .catch(() => {
            if (!disposed) setReady(false)
          })
      },
      { rootMargin: '160px' },
    )
    observer.observe(host)
    return () => {
      disposed = true
      observer.disconnect()
      controllerRef.current?.dispose()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.setPaused(paused || reduced)
  }, [paused, ready, reduced])

  return (
    <>
      <div className="globe-visual" data-renderer={ready ? 'webgl' : 'fallback'} aria-hidden="true">
        {!ready && <GlobeFallback />}
        <div ref={hostRef} className={`globe-webgl${ready ? ' is-ready' : ''}`} />
        <div ref={labelRef} className="globe-origin">
          <span className="globe-origin-line" />
          <span className="globe-origin-copy">
            {t('长沙')}
            <small>28.23° N / 112.94° E</small>
          </span>
        </div>
      </div>
      {ready && (
        <div className="globe-tools" role="group" aria-label={t('地球展示控制')}>
          <span className="globe-caption">{t('数字地球')}</span>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-label={t(paused ? '继续地球动画' : '暂停地球动画')}
              title={t(paused ? '继续地球动画' : '暂停地球动画')}
            >
              {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => controllerRef.current?.reset()}
            aria-label={t('重置地球视角')}
            title={t('重置地球视角')}
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  )
}
