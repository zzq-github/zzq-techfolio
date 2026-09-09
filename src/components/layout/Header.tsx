import { usePreferences } from '../../preferences/context'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { PreferenceControls } from './PreferenceControls'
import { motion, useReducedMotion, useScroll } from 'framer-motion'

const navItems = [
  { label: '首页', href: '#home' },
  { label: '能力', href: '#skills' },
  { label: '项目', href: '#projects' },
  { label: '经历', href: '#experience' },
  { label: '开源', href: '#open-source' },
  { label: '联系', href: '#contact' },
]

export function Header() {
  const { t } = usePreferences()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')
  const button = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive('#' + entry.target.id)
        })
      },
      { rootMargin: '-18% 0px -60% 0px' },
    )
    navItems.forEach(({ href }) => {
      const node = document.querySelector(href)
      if (node) observer.observe(node)
    })
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('resize', closeOnResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', closeOnResize)
    }
  }, [])
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', escape)
    window.addEventListener('pointerdown', outside)
    return () => {
      window.removeEventListener('keydown', escape)
      window.removeEventListener('pointerdown', outside)
    }
  }, [open])
  return (
    <header className="site-header" ref={header}>
      <a className="skip-link" href="#main">
        {' '}
        {t('跳转到正文')}{' '}
      </a>
      <div className="header-inner">
        <a className="brand" href="#home" aria-label={t('周志强，返回首页')}>
          <span className="brand-icon">
            <img src={`${import.meta.env.BASE_URL}brand-logo-3d-144.png`} width="44" height="44" alt="" />
          </span>
          <span>
            ZZQ<span className="brand-period">.</span>
            <small>DEVELOPER</small>
          </span>
        </a>
        <button
          ref={button}
          className="menu-button"
          type="button"
          aria-label={open ? t('关闭导航菜单') : t('打开导航菜单')}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={open ? 'nav-open' : ''} aria-label={t('主导航')}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? 'location' : undefined}
              onClick={() => {
                setOpen(false)
                setActive(item.href)
              }}
            >
              {active === item.href && (
                <motion.span
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                />
              )}
              <span className="nav-label">{t(item.label)}</span>
            </a>
          ))}
        </nav>
        <PreferenceControls />
      </div>
      <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    </header>
  )
}
