import type { Tune } from '@/lib/types'

/**
 * Case-insensitive substring match across a tune's title, rhythm, key, and
 * story. An empty query matches everything.
 */
export function matchesQuery(tune: Tune, q: string): boolean {
  if (!q) return true
  const haystack =
    `${tune.title} ${tune.rhythm} ${tune.key} ${tune.narrative}`.toLowerCase()
  return haystack.includes(q.toLowerCase())
}
