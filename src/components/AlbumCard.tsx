import { Disc3, ExternalLink } from 'lucide-react'
import type { Album, AlbumLinks, AlbumRole } from '@/lib/types'

interface AlbumCardProps {
  album: Album
}

const ROLE_LABEL: Record<AlbumRole, string> = {
  solo: 'Solo album',
  member: 'Band member',
  ensemble: 'Ensemble',
  guest: 'Guest appearance',
}

/** Outbound links in display priority: listen/buy first, reference last. */
const LINK_ORDER: { key: keyof AlbumLinks; label: string }[] = [
  { key: 'bandcamp', label: 'Bandcamp' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'appleMusic', label: 'Apple Music' },
  { key: 'compass', label: 'Compass' },
  { key: 'allmusic', label: 'AllMusic' },
  { key: 'discogs', label: 'Discogs' },
]

/**
 * A single record in the discography. Albums are external releases, so instead
 * of a modal the card carries a styled sleeve placeholder (no copyrighted cover
 * art) plus outbound links to listen or buy.
 */
export function AlbumCard({ album }: AlbumCardProps) {
  const links = LINK_ORDER.filter(({ key }) => album.links[key]).map(
    ({ key, label }) => ({ label, url: album.links[key] as string })
  )

  return (
    <article className="flex gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:gap-5 sm:p-5">
      <div
        aria-hidden="true"
        className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-20"
      >
        <Disc3 className="size-8 sm:size-9" />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
          {album.title}{' '}
          <span className="font-normal text-muted-foreground">
            ({album.year})
          </span>
        </h2>
        <p className="text-base text-foreground/90">{album.artist}</p>
        <p className="text-sm text-muted-foreground">
          {ROLE_LABEL[album.role]} · {album.label}
        </p>
        {album.notes && (
          <p className="mt-1 text-sm text-muted-foreground">{album.notes}</p>
        )}

        {links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map(({ label, url }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground ring-1 ring-foreground/10 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {label}
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground italic">
            Listen/buy link coming soon.
          </p>
        )}
      </div>
    </article>
  )
}
