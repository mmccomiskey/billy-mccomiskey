import type { Tune } from '@/lib/types'
import tunesData from './tunes.json'

/**
 * The master composition dataset, bundled into the app at build time.
 * `tunes.json` is the single source of truth; the build also publishes a copy
 * to `dist/data/tunes.json` for external consumers (ITMA ingest, crawlers, the
 * local MCP tool).
 */
export const tunes = tunesData as unknown as Tune[]

export function getTuneById(id: string): Tune | undefined {
  return tunes.find((t) => t.id === id)
}
