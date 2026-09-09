import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PreferencesContext, type Language, type Theme } from './context'
import { translate } from '../i18n/translate'
import { profile } from '../data/profile'

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    document.documentElement.dataset.language === 'en' ? 'en' : 'zh',
  )
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = document.documentElement.dataset.themePreference
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      document.documentElement.dataset.themePreference = theme
      document.documentElement.style.colorScheme = resolved
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#060b10' : '#f4f8f9')
    }
    apply()
    media.addEventListener('change', apply)
    try {
      localStorage.setItem('techfolio.theme', theme)
    } catch {
      /* Storage may be disabled. */
    }
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.documentElement.dataset.language = language
    const name = translate(language, profile.name)
    const title = `${name} | AI Application · GIS · Full Stack Developer`
    const description = translate(
      language,
      '周志强个人技术主页，10年软件研发经验，专注 AI Agent、GIS 三维可视化、Cesium、SuperMap、React、Vue 与全栈应用开发。',
    )
    document.title = title
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute('content', title)
    }
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      document.querySelector(selector)?.setAttribute('content', description)
    }
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', language === 'zh' ? 'zh_CN' : 'en_US')
    try {
      localStorage.setItem('techfolio.language', language)
    } catch {
      /* Storage may be disabled. */
    }
  }, [language])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === 'techfolio.language' || event.key === null)
        setLanguage(event.newValue === 'en' ? 'en' : 'zh')
      if (event.key === 'techfolio.theme' || event.key === null) {
        setTheme(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system')
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const value = useMemo(
    () => ({
      language,
      theme,
      setLanguage,
      setTheme,
      t: (text: string, params?: Record<string, string | number>) => translate(language, text, params),
    }),
    [language, theme],
  )
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
