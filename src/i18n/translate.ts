import { en } from './en'
import type { Language } from '../preferences/context'

export function translate(language: Language, text: string, params: Record<string, string | number> = {}) {
  const message = language === 'en' ? (en[text] ?? text) : text
  return message.replace(/\{(\w+)\}/g, (token, key: string) => String(params[key] ?? token))
}

export function translateContent<T>(content: T, language: Language): T {
  if (typeof content === 'string') return translate(language, content) as T
  if (Array.isArray(content)) return content.map((item) => translateContent(item, language)) as T
  if (content && typeof content === 'object') {
    return Object.fromEntries(
      Object.entries(content).map(([key, value]) => [key, translateContent(value, language)]),
    ) as T
  }
  return content
}
