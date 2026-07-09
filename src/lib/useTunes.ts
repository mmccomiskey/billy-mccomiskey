import { useEffect, useState } from 'react'
import type { Tune } from '@/lib/types'

interface TunesState {
  tunes: Tune[]
  loading: boolean
  error: string | null
}

/**
 * Loads the master composition dataset from the static asset
 * `public/data/tunes.json`. Kept as a runtime fetch (rather than a bundled
 * import) so the same file can be consumed by external clients and the local
 * MCP dev tools without a build step.
 */
export function useTunes(): TunesState {
  const [state, setState] = useState<TunesState>({
    tunes: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    const url = `${import.meta.env.BASE_URL}data/tunes.json`

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load tunes (${res.status})`)
        return res.json() as Promise<Tune[]>
      })
      .then((tunes) => {
        if (!cancelled) setState({ tunes, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load tunes'
          setState({ tunes: [], loading: false, error: message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
