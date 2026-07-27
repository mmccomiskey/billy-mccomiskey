import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * Persistent vertical nav rail for desktop (left side). Hidden on mobile,
 * where MobileNav takes over at the bottom of the screen.
 */
export function DesktopSidebar() {
  return (
    <nav
      aria-label="Primary"
      className="hidden w-40 shrink-0 bg-sidebar text-sidebar-foreground md:block"
    >
      <ul className="sticky top-0 flex flex-col gap-2 p-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex w-full flex-col items-center gap-2 rounded-xl px-3 py-5 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/60',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                )
              }
            >
              <Icon aria-hidden="true" className="size-8" />
              <span className="text-base font-semibold tracking-wide uppercase">
                {label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Persistent bottom tab bar for mobile, kept at thumb level with native
 * safe-area padding so gesture bars don't overlap the labels.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-safe md:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex w-full flex-col items-center gap-1 px-2 pt-2 pb-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden="true" className="size-6" />
                  <span
                    className={cn(
                      'text-sm tracking-wide uppercase',
                      isActive
                        ? 'border-t-2 border-primary pt-0.5 font-semibold'
                        : 'font-medium'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
