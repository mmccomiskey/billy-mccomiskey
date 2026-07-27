import { Music, Disc3, Info, type LucideIcon } from 'lucide-react'

export interface NavItem {
  /** Route path (relative to the app basename). */
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tunes', icon: Music },
  { to: '/albums', label: 'Albums', icon: Disc3 },
  { to: '/about', label: 'About', icon: Info },
]
