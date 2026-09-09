import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}

// React and the canvas respond to preference changes without requiring a reload.
export const useMotionPreference = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  )
