import { usePreferences } from '../../preferences/context'
import { useContent } from '../../i18n/useContent'
import { ArrowDown, ArrowUpRight, CodeXml, FileDown, MapPin, ScanLine } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useMotionPreference } from '../../hooks/useMotionPreference'
import { siteConfig } from '../../config/site'
import type { PointerEvent } from 'react'
import { GeoGlobe } from './GeoGlobe'

export function Hero() {
  const { t } = usePreferences()
  const { profile } = useContent()
  const reduced = useMotionPreference()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const moveX = useSpring(x, { stiffness: 70, damping: 22 })
  const moveY = useSpring(y, { stiffness: 70, damping: 22 })
  const rearX = useTransform(moveX, (value) => value * -0.55)
  const rearY = useTransform(moveY, (value) => value * -0.55)
  const moveScene = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10)
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8)
  }
  return (
    <section className="hero" id="home">
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
            className="button hero-github"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label={t('在新窗口打开 GitHub')}
          >
            <CodeXml size={17} aria-hidden="true" /> <span>GitHub</span>
          </a>
        </div>
        <div className="hero-footnote">
          <MapPin size={14} aria-hidden="true" /> {profile.location}
          {t('，中国')} <span /> {t('10 年工程经验')}{' '}
        </div>
      </motion.div>
      <motion.div
        className="spatial-scene"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        onPointerMove={moveScene}
        onPointerLeave={() => {
          x.set(0)
          y.set(0)
        }}
      >
        <GeoGlobe />
        <div className="scene-corner corner-top" aria-hidden="true" />
        <div className="scene-corner corner-bottom" aria-hidden="true" />
        <div className="scene-label" aria-hidden="true">
          <ScanLine size={15} />
          <span>SPATIAL INTELLIGENCE</span>
          <span className="status-dot" />
        </div>
        <motion.div
          className="scene-tag scene-tag-ai"
          aria-hidden="true"
          style={{ x: reduced ? 0 : moveX, y: reduced ? 0 : moveY }}
        >
          <span className="mini-cross">+</span>
          <div>
            AI APPLICATION<small> {t('从智能交互到业务集成')} </small>
          </div>
        </motion.div>
        <motion.div
          className="scene-tag scene-tag-gis"
          aria-hidden="true"
          style={{ x: reduced ? 0 : rearX, y: reduced ? 0 : rearY }}
        >
          <span className="mini-cross">+</span>
          <div>
            GEOSPATIAL SYSTEMS<small> {t('让多源空间数据可见')} </small>
          </div>
        </motion.div>
        <div className="scene-footer" aria-hidden="true">
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
