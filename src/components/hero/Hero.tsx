import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { ArrowDown, ArrowUpRight, CodeXml, FileDown, MapPin, ScanLine } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { siteConfig } from '../../config/site'
import type { PointerEvent } from 'react'
import { GeoGlobe } from './GeoGlobe'

export function Hero() {
  const { t } = usePreferences()
  const { profile } = useContent()
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const moveX = useSpring(x, { stiffness: 70, damping: 22 })
  const moveY = useSpring(y, { stiffness: 70, damping: 22 })
  const moveScene = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 18)
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 14)
  }
  return (
    <section
      className="hero"
      id="home"
      onPointerMove={moveScene}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <div className="hero-topline" aria-hidden="true">
        <span>PERSONAL PORTFOLIO / 2026</span>
        <span>
          INTELLIGENCE MEETS SPACE <ArrowUpRight size={13} />
        </span>
      </div>
      <motion.div
        className="hero-copy"
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <p className="eyebrow">
          <span className="status-dot" /> AI APPLICATION / GIS / FULL STACK
        </p>
        <div className="hero-identity">
          <span>{profile.name}</span>
          <span className="identity-divider" />
          <span>ZHOU ZHIQIANG</span>
        </div>
        <h1>
          {profile.headline[0]}
          <br />
          <span>{profile.headline[1]}</span>
        </h1>
        <p className="hero-role">{profile.chineseTitle}</p>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a className="button primary" href="#projects">
            {' '}
            {t('探索我的项目')} <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          {siteConfig.enableResumeDownload && (
            <a
              className="button ghost"
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t('在新窗口打开 PDF 简历')}
            >
              <FileDown size={17} aria-hidden="true" /> {t('下载简历')}{' '}
            </a>
          )}
          <a
            className="button icon-button"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label={t('在新窗口打开 GitHub')}
          >
            <CodeXml size={19} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-footnote">
          <MapPin size={14} aria-hidden="true" /> {profile.location}
          {t('，中国')} <span /> {t('10 年工程经验')}{' '}
        </div>
      </motion.div>
      <motion.div
        className="spatial-scene"
        style={{ x: reduced ? 0 : moveX, y: reduced ? 0 : moveY }}
        aria-hidden="true"
      >
        <GeoGlobe />
        <div className="scene-corner corner-top" />
        <div className="scene-corner corner-bottom" />
        <div className="scene-label">
          <ScanLine size={15} />
          <span>SPATIAL INTELLIGENCE</span>
          <span className="status-dot" />
        </div>
        <div className="scene-tag scene-tag-ai">
          <span className="mini-cross">+</span>
          <div>
            AI APPLICATION<small> {t('从智能交互到业务集成')} </small>
          </div>
        </div>
        <div className="scene-tag scene-tag-gis">
          <span className="mini-cross">+</span>
          <div>
            GEOSPATIAL SYSTEMS<small> {t('让多源空间数据可见')} </small>
          </div>
        </div>
        <div className="scene-footer">
          <span>
            28.2282° N<br />
            112.9388° E
          </span>
          <span>
            CESIUM / SUPERMAP
            <br />
            <b>CONNECTED TO THE REAL WORLD</b>
          </span>
        </div>
      </motion.div>
      <div className="hero-bottom">
        <a href="#skills">
          <ArrowDown size={15} aria-hidden="true" /> {t('向下探索')} <span>SCROLL TO EXPLORE</span>
        </a>
        <div>
          AI <i>×</i> GIS <i>×</i> ENGINEERING
        </div>
      </div>
    </section>
  )
}
