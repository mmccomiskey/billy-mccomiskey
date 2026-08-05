import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Share2, Check, Maximize2, Images } from 'lucide-react'
import { getTuneById } from '@/data/tunes'
import { AbcTune } from '@/components/AbcTune'
import { NotationNotice } from '@/components/NotationNotice'
import { TuneNarrative } from '@/components/TuneNarrative'
import { TuneMediaViewer } from '@/components/TuneMediaViewer'

function formatCredit(label: string, value?: string) {
  if (!value) return null
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-semibold text-foreground">{label}:</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  )
}

/** Copy-link / native-share button with a brief "copied" confirmation. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user dismissed the share sheet — nothing to do
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked — no-op for the prototype
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground ring-1 ring-foreground/10 transition-colors outline-none hover:ring-2 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      {copied ? (
        <>
          <Check aria-hidden="true" className="size-4 text-primary" />
          Link copied
        </>
      ) : (
        <>
          <Share2 aria-hidden="true" className="size-4" />
          Share
        </>
      )}
    </button>
  )
}

/**
 * Dedicated page for a single tune (replaces the old modal): a contextual
 * hero image, the notation + Play button, the story, manuscripts, and credits.
 * The full-screen media viewer is driven by an `?image=<index>` query param so
 * it's shareable and closes on the browser Back button — no stacked modals.
 */
export function TuneView() {
  const { tuneId } = useParams()
  const tune = tuneId ? getTuneById(tuneId) : undefined
  const [searchParams, setSearchParams] = useSearchParams()

  if (!tune) {
    return (
      <section className="mx-auto max-w-xl text-center">
        <h1 className="font-heading mb-3 text-2xl font-semibold text-foreground">
          Tune not found
        </h1>
        <p className="mb-6 text-muted-foreground">
          We couldn&apos;t find a tune with that address.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All tunes
        </Link>
      </section>
    )
  }

  const images = tune.images ?? []
  const contextImage = images.find((i) => i.kind === 'photo') ?? images[0]
  const stripImages = images.filter((i) => i !== contextImage)

  // Media-viewer open state lives in the URL (?image=<slide index>).
  const imageParam = searchParams.get('image')
  const viewerOpen = imageParam !== null
  const startIndex = imageParam ? Number(imageParam) : 0

  function openViewer(index: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('image', String(index))
      return next
    })
  }

  function setViewerOpen(open: boolean) {
    if (open) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('image')
        return next
      },
      { replace: true }
    )
  }

  return (
    <article aria-labelledby="tune-title" className="mx-auto max-w-3xl">
      {/* Top bar: back + share */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All tunes
        </Link>
        <ShareButton title={`${tune.title} — Billy McComiskey`} />
      </div>

      {/* Heading */}
      <header className="mb-5">
        <h1
          id="tune-title"
          className="font-heading text-3xl font-semibold text-foreground sm:text-4xl"
        >
          {tune.title}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          <span className="capitalize">{tune.rhythm}</span> · Key of {tune.key}
        </p>
      </header>

      {/* Contextual hero image */}
      {contextImage && (
        <figure className="mb-6">
          <button
            type="button"
            onClick={() => openViewer(images.indexOf(contextImage) + 1)}
            aria-label={`View ${contextImage.caption ?? contextImage.alt} full screen`}
            className="group block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <img
              src={contextImage.src}
              alt={contextImage.alt}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
          <figcaption className="mt-2 text-sm text-muted-foreground italic">
            {contextImage.caption ?? contextImage.alt}
          </figcaption>
        </figure>
      )}

      <div className="space-y-6">
        <NotationNotice
          source={tune.notationSource}
          sourceUrl={tune.notationSourceUrl}
        />

        <AbcTune abc={tune.abcNotation} title={tune.title} rhythm={tune.rhythm} />

        <section aria-label="The story behind this tune">
          <h2 className="font-heading mb-2 text-xl font-semibold text-foreground">
            The Story
          </h2>
          <TuneNarrative key={tune.id} text={tune.narrative} />
        </section>

        {stripImages.length > 0 && (
          <section aria-label="Manuscripts">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Manuscripts
              </h2>
              <button
                type="button"
                onClick={() => openViewer(1)}
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Maximize2 aria-hidden="true" className="size-4" />
                Open gallery
              </button>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
              {stripImages.map((img) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => openViewer(images.indexOf(img) + 1)}
                  aria-label={`View ${img.caption ?? img.alt} full screen`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition-transform outline-none hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <img
                    src={img.src}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {images.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Images aria-hidden="true" className="size-3.5" />
            Prototype — placeholder images.
          </p>
        )}

        <section aria-label="Credits and archival details">
          <h2 className="font-heading mb-2 text-xl font-semibold text-foreground">
            Credits &amp; Archive
          </h2>
          <dl className="space-y-1 text-base">
            {formatCredit('Composer', tune.credits.composer)}
            {formatCredit('Story by', tune.credits.storyBy)}
            {formatCredit('Editor', tune.credits.editor)}
            {formatCredit('Collection', tune.archivalMetadata.sourceCollection)}
            {formatCredit('Rights holder', tune.archivalMetadata.rightsHolder)}
            {formatCredit('Recording date', tune.archivalMetadata.recordingDate)}
          </dl>
        </section>
      </div>

      {images.length > 0 && (
        <TuneMediaViewer
          tune={tune}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          startIndex={startIndex}
        />
      )}
    </article>
  )
}
