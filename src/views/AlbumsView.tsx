import { useMemo } from 'react'
import { albums } from '@/data/albums'
import { AlbumCard } from '@/components/AlbumCard'

/**
 * Billy's discography: solo records, his bands (The Irish Tradition, Trian), and
 * ensemble/guest appearances. Albums are external releases, so each card links
 * out to listen or buy rather than opening an in-app detail view.
 */
export function AlbumsView() {
  const sorted = useMemo(
    () => [...albums].sort((a, b) => b.year - a.year),
    []
  )

  return (
    <section aria-labelledby="albums-heading">
      <h1
        id="albums-heading"
        className="font-heading mb-4 text-center text-3xl font-semibold text-foreground sm:text-4xl"
      >
        Albums
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-center text-base text-muted-foreground">
        A discography of Billy&apos;s recordings — solo, with The Irish Tradition
        and Trian, and with Mick Moloney&apos;s Green Fields of America. Each
        album links out to listen or buy.
      </p>

      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {sorted.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  )
}
