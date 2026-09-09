// Apply the saved appearance before styles and React load to prevent a theme flash.
;(() => {
  let theme = 'system'
  let language = 'zh'
  try {
    const savedTheme = localStorage.getItem('techfolio.theme')
    const savedLanguage = localStorage.getItem('techfolio.language')
    if (['light', 'dark', 'system'].includes(savedTheme)) theme = savedTheme
    if (['zh', 'en'].includes(savedLanguage)) language = savedLanguage
  } catch {
    // Preferences still work for this visit when browser storage is unavailable.
  }
  const resolved =
    theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme
  const root = document.documentElement
  root.dataset.theme = resolved
  root.dataset.themePreference = theme
  root.dataset.language = language
  root.lang = language === 'zh' ? 'zh-CN' : 'en'
  root.style.colorScheme = resolved
})()
