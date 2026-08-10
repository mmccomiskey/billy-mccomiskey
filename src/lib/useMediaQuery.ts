import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query and re-render when it changes. Unlike Tailwind
 * responsive classes (which only toggle `display`), this lets a component render
 * one branch or the other so only the active markup is in the DOM.
 *
 * Client-only (this is a CSR SPA), so the server snapshot is a safe `false`.
 */
export function useMediaQuery(query: string): boolean {
  function subscribe(onChange: () => void) {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
  const getSnapshot = () => window.matchMedia(query).matches
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
