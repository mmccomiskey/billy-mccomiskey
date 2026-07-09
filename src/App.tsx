import { useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { DesktopSidebar, MobileNav } from '@/components/Navigation'
import { TunesView } from '@/views/TunesView'
import { AlbumsView } from '@/views/AlbumsView'
import { AboutView } from '@/views/AboutView'
import { useTunes } from '@/lib/useTunes'
import type { View } from '@/lib/nav'

function App() {
  const [view, setView] = useState<View>('tunes')
  const [query, setQuery] = useState('')
  const { tunes, loading, error } = useTunes()

  function handleSearch(value: string) {
    setQuery(value)
    // Searching always surfaces matching tunes, even from another tab.
    if (value.trim()) setView('tunes')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>

      <SiteHeader query={query} onQueryChange={handleSearch} />

      <div className="flex flex-1">
        <DesktopSidebar active={view} onChange={setView} />

        <main
          id="main-content"
          className="flex-1 px-4 pt-8 pb-28 md:pb-12"
        >
          <div className="mx-auto w-full max-w-4xl">
            {view === 'tunes' && (
              <TunesView
                tunes={tunes}
                loading={loading}
                error={error}
                query={query}
              />
            )}
            {view === 'albums' && <AlbumsView />}
            {view === 'about' && <AboutView />}
          </div>
        </main>
      </div>

      <MobileNav active={view} onChange={setView} />
    </div>
  )
}

export default App
