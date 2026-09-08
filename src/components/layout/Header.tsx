import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Command, Menu, X } from 'lucide-react'
import { motion, useScroll } from 'framer-motion'

const navItems = [
  { label: '首页', href: '#home' },
  { label: '能力', href: '#skills' },
  { label: '项目', href: '#projects' },
  { label: '经历', href: '#experience' },
  { label: '开源', href: '#open-source' },
  { label: '联系', href: '#contact' },
]

export function Header() {
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
        跳转到正文
      </a>
      <div className="header-inner">
        <a className="brand" href="#home" aria-label="周志强，返回首页">
          <span className="brand-icon">
            <Command size={20} aria-hidden="true" />
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
          aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={open ? 'nav-open' : ''} aria-label="主导航">
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
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contact">
          聊聊合作 <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
      <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    </header>
  )
}
