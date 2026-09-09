import { useContent } from '../../i18n/useContent'
import { usePreferences } from '../../preferences/context'

export function Footer() {
  const { t } = usePreferences()
  const { profile } = useContent()
  return (
    <footer className="site-footer">
      <p>
        © {new Date().getFullYear()} {profile.name}
      </p>
      <p>AI · GIS · FULL STACK</p>
      <a href="#home">{t('返回顶部')} ↑</a>
    </footer>
  )
}
