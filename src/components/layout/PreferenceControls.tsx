import { Languages, Monitor, Moon, Sun } from 'lucide-react'
import { usePreferences, type Theme } from '../../preferences/context'

export function PreferenceControls() {
  const { language, setLanguage, theme, setTheme, t } = usePreferences()
  const ThemeIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun
  return (
    <div className="preference-controls" role="group" aria-label={t('语言与外观')}>
      <button
        className="language-switch"
        type="button"
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        aria-label={language === 'zh' ? 'Switch to English' : '切换为中文'}
      >
        <Languages size={16} aria-hidden="true" />
        <span lang={language === 'zh' ? 'en' : 'zh-CN'}>{language === 'zh' ? 'EN' : '中文'}</span>
      </button>
      <label className="theme-control">
        <ThemeIcon size={16} aria-hidden="true" />
        <span className="sr-only">{t('外观主题')}</span>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
          aria-label={t('外观主题')}
        >
          <option value="light">{t('亮色')}</option>
          <option value="dark">{t('暗色')}</option>
          <option value="system">{t('跟随系统')}</option>
        </select>
      </label>
    </div>
  )
}
