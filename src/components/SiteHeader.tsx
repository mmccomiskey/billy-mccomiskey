import { Search } from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

interface SiteHeaderProps {
  query: string
  onQueryChange: (value: string) => void
}

/**
 * Forest-green top header spanning the full width: gold wordmark plus a
 * prominent search capsule. The search input uses a 16px (text-base) font so
 * iOS Safari does not auto-zoom the viewport when it receives focus.
 */
export function SiteHeader({ query, onQueryChange }: SiteHeaderProps) {
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
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-sidebar-foreground/70"
            />
            <input
              id="tune-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search for Tunes, Albums, etc."
              className="h-12 w-full rounded-full border border-sidebar-border bg-sidebar-accent/40 pr-4 pl-12 text-base text-sidebar-foreground placeholder:text-sidebar-foreground/60 outline-none transition-shadow focus-visible:border-sidebar-ring focus-visible:ring-3 focus-visible:ring-sidebar-ring/50"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
