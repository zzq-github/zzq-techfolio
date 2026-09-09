import * as source from '../data/profile'
import { usePreferences } from '../preferences/context'
import { translateContent } from './translate'

const content = { zh: source, en: translateContent(source, 'en') }

export function useContent() {
  return content[usePreferences().language]
}
