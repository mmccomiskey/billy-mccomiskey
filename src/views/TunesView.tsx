import { useMemo, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { tunes } from '@/data/tunes'
import { TuneCard } from '@/components/TuneCard'
import { matchesQuery } from '@/lib/search'
import { useMediaQuery } from '@/lib/useMediaQuery'

/** The tune-book search input. Rendered twice (desktop top / mobile bottom), so
 * it takes a unique id and shares the query state from the parent. */
function SearchField({
  id,
  query,
  setQuery,
}: {
  id: string
  query: string
  setQuery: (value: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <form
      role="search"
      className="mx-auto w-full max-w-xl"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor={id} className="sr-only">
        Search the tune book
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          id={id}
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
            onClick={() => {
              setQuery('')
              ref.current?.focus()
            }}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </form>
  )
}

export function TunesView() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  // md breakpoint. Renders one search or the other — never both in the DOM.
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Back-compat: old deep links used /?tune=<id>. Send them to the new page.
  const legacyTune = searchParams.get('tune')

  const filtered = useMemo(
    () => tunes.filter((t) => matchesQuery(t, query.trim())),
    [query]
  )

  if (legacyTune) return <Navigate to={`/tunes/${legacyTune}`} replace />

  return (
    <section
      aria-labelledby="tunes-heading"
      className={isDesktop ? undefined : 'pb-20'}
    >
      <h1
        id="tunes-heading"
        className="font-heading mb-6 text-center text-3xl font-semibold text-foreground sm:text-4xl"
      >
        Tune Book
      </h1>

      {/* Desktop: sticky search at the top of the list. */}
      {isDesktop && (
        <div className="sticky top-0 z-20 -mx-4 mb-2 bg-background px-4 pt-3 pb-8">
          <SearchField id="tune-search" query={query} setQuery={setQuery} />
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-base text-muted-foreground">
          No tunes match “{query}”.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((tune) => (
          <TuneCard key={tune.id} tune={tune} />
        ))}
      </div>

      {/* Mobile: search pinned to the bottom, just above the nav, for thumb
          reach. Offset by the nav height (+ safe area on devices with a home
          indicator). */}
      {!isDesktop && (
        <div className="fixed inset-x-0 bottom-[calc(73px+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <SearchField id="tune-search" query={query} setQuery={setQuery} />
        </div>
      )}
    </section>
  )
}
