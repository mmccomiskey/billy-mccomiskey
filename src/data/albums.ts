import type { Album } from '@/lib/types'
import albumsData from './albums.json'

/**
 * Discography of records Billy appears on — solo, with his bands (The Irish
 * Tradition, Trian), and with Mick Moloney's Green Fields of America. Bundled at
 * build time; `albums.json` is the single source of truth.
 */
export const albums = albumsData as unknown as Album[]

export function getAlbumById(id: string): Album | undefined {
  return albums.find((a) => a.id === id)
}
