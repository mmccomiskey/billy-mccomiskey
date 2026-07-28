import { Routes, Route, Navigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { DesktopSidebar, MobileNav } from '@/components/Navigation'
import { TunesView } from '@/views/TunesView'
import { AlbumsView } from '@/views/AlbumsView'
import { AboutView } from '@/views/AboutView'

function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <div className="flex flex-1">
        <DesktopSidebar />

        <main id="main-content" className="flex-1 px-4 pt-8 pb-28 md:pb-12">
          <div className="mx-auto w-full max-w-4xl">
            <Routes>
              <Route path="/" element={<TunesView />} />
              <Route path="/albums" element={<AlbumsView />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}

export default App
