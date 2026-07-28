import { AppLogo } from '@/components/AppLogo'

/**
 * Forest-green top header spanning the full width: the gold wordmark, centered.
 * Search lives on the Tune Book page itself (TunesView), next to the list it
 * filters, so the header stays the same on every page.
 */
export function SiteHeader() {
  return (
    <header className="bg-sidebar text-sidebar-foreground pt-safe">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-6 sm:py-7">
        <AppLogo className="text-center text-3xl sm:text-4xl" />
      </div>
    </header>
  )
}
