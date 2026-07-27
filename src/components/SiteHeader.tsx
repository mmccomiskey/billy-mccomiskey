import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

interface SiteHeaderProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Forest-green top header spanning the full width: gold wordmark plus a
 * prominent cream search pill. The pill inverts against the green header so it
 * reads unmistakably as an input rather than blending into the banner. The
 * search input uses a 16px (text-base) font so iOS Safari does not auto-zoom
 * the viewport when it receives focus.
 */
export function SiteHeader({ query, onQueryChange }: SiteHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClear() {
    onQueryChange('')
    // Keep focus in the field so the visitor can immediately retype.
    inputRef.current?.focus()
  }

  return (
    <header className="bg-sidebar text-sidebar-foreground pt-safe">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-5 sm:py-6">
        <AppLogo className="text-center text-3xl sm:text-4xl" />

        <form
          role="search"
          className="w-full max-w-xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="tune-search" className="sr-only">
            Search for tunes, albums, and more
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[var(--ring)]"
            />
            <input
              ref={inputRef}
              id="tune-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search tunes by name, rhythm, or key"
              className="h-12 w-full rounded-full border border-[var(--brand-gold-soft)] bg-card pr-11 pl-12 text-base text-card-foreground shadow-[0_2px_10px_rgba(0,0,0,0.25)] outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </header>
  )
}
