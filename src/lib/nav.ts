import { Music, Disc3, Info, type LucideIcon } from 'lucide-react'

export type View = 'tunes' | 'albums' | 'about'

export interface NavItem {
  view: View
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'tunes', label: 'Tunes', icon: Music },
  { view: 'albums', label: 'Albums', icon: Disc3 },
  { view: 'about', label: 'About', icon: Info },
]
