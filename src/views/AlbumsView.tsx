import { Disc3 } from 'lucide-react'

/**
 * Placeholder for the Albums / Recent Releases view. Discography data will be
 * added to the archive schema in a later pass.
 */
export function AlbumsView() {
  return (
    <section aria-labelledby="albums-heading">
      <h1
        id="albums-heading"
        className="font-heading mb-6 text-center text-3xl font-semibold text-foreground sm:text-4xl"
      >
        Albums
      </h1>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl bg-card px-6 py-12 text-center ring-1 ring-foreground/10">
        <Disc3 aria-hidden="true" className="size-12 text-brand-gold" />
        <p className="text-lg font-medium text-foreground">
          Recent Releases coming soon
        </p>
        <p className="text-base text-muted-foreground">
          Billy&apos;s discography and recent releases will be catalogued here.
        </p>
      </div>
    </section>
  )
}
