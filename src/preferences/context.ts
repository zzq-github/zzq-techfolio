import { createContext, useContext } from 'react'

export type Language = 'zh' | 'en'
export type Theme = 'light' | 'dark' | 'system'
export type Translate = (text: string, params?: Record<string, string | number>) => string

export const PreferencesContext = createContext<{
  language: Language
  theme: Theme
  setLanguage: (value: Language) => void
  setTheme: (value: Theme) => void
  t: Translate
} | null>(null)

export function usePreferences() {
  const preferences = useContext(PreferencesContext)
  if (!preferences) throw new Error('PreferencesProvider is required')
  return preferences
}
