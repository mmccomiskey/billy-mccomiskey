import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import type { Tune } from '@/lib/types'
import { tunes, getTuneById } from '@/data/tunes'
import { TuneCard } from '@/components/TuneCard'
import { TuneModal } from '@/components/TuneModal'

function matchesQuery(tune: Tune, q: string): boolean {
  if (!q) return true
  const haystack =
    `${tune.title} ${tune.rhythm} ${tune.key} ${tune.narrative}`.toLowerCase()
  return haystack.includes(q.toLowerCase())
}

export function TunesView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tuneParam = searchParams.get('tune')
  const selected = tuneParam ? getTuneById(tuneParam) : undefined
  const [notFound, setNotFound] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // A ?tune= that doesn't match any tune: drop the param and let the visitor
  // know, rather than opening an empty modal. Data is bundled (synchronous),
  // so there's no loading race to guard against.
  useEffect(() => {
    if (tuneParam && !getTuneById(tuneParam)) {
      setNotFound(tuneParam)
      setSearchParams({}, { replace: true })
    }
  }, [tuneParam, setSearchParams])

  const filtered = useMemo(
    () => tunes.filter((t) => matchesQuery(t, query.trim())),
    [query]
  )

  function openTune(tune: Tune) {
    setNotFound(null)
    setSearchParams({ tune: tune.id })
  }

  function handleOpenChange(open: boolean) {
    if (!open) setSearchParams({}, { replace: true })
  }

  function clearSearch() {
    setQuery('')
    searchRef.current?.focus()
  }

  return (
    <section aria-labelledby="tunes-heading">
      <h1
        id="tunes-heading"
        className="font-heading mb-6 text-center text-3xl font-semibold text-foreground sm:text-4xl"
      >
        Tune Book
      </h1>

      <div className="sticky top-0 z-20 bg-background pt-3 pb-8">
        <form
          role="search"
          className="mx-auto w-full max-w-xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="tune-search" className="sr-only">
            Search the tune book
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              id="tune-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, type, or key"
              className="h-12 w-full rounded-full bg-card pr-11 pl-12 text-base text-foreground ring-1 ring-foreground/10 outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/60"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {notFound && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-base text-amber-900 dark:text-amber-200"
        >
          <p>
            We couldn&apos;t find a tune called “{notFound}”. Here are all of
            them.
          </p>
          <button
            type="button"
            onClick={() => setNotFound(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded-md p-1 outline-none hover:bg-amber-500/20 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-base text-muted-foreground">
          No tunes match “{query}”.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((tune) => (
          <TuneCard key={tune.id} tune={tune} onOpen={openTune} />
        ))}
      </div>

      <TuneModal
        tune={selected ?? null}
        open={!!selected}
        onOpenChange={handleOpenChange}
      />
    </section>
  )
}
