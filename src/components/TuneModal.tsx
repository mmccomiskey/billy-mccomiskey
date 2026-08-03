import { useState } from 'react'
import { Images, Maximize2 } from 'lucide-react'
import type { Tune } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AbcTune } from '@/components/AbcTune'
import { NotationNotice } from '@/components/NotationNotice'
import { TuneNarrative } from '@/components/TuneNarrative'
import { TuneMediaViewer } from '@/components/TuneMediaViewer'

interface TuneModalProps {
  tune: Tune | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCredit(label: string, value?: string) {
  if (!value) return null
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-semibold text-foreground">{label}:</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  )
}

/**
 * High-contrast detail view for a single tune: SVG notation + Play button,
 * the full narrative, credits, and ITMA-style archival metadata.
 */
export function TuneModal({ tune, open, onOpenChange }: TuneModalProps) {
  if (!tune) return null
  return <TuneModalContent tune={tune} open={open} onOpenChange={onOpenChange} />
}

function TuneModalContent({
  tune,
  open,
  onOpenChange,
}: {
  tune: Tune
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [viewerOpen, setViewerOpen] = useState(false)
  // Slide 0 is the engraved notation; images start at 1.
  const [viewerStart, setViewerStart] = useState(0)
  const images = tune.images ?? []

  function openViewer(startIndex: number) {
    setViewerStart(startIndex)
    setViewerOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tune.title}</DialogTitle>
            <DialogDescription>
              <span className="capitalize">{tune.rhythm}</span> · Key of{' '}
              {tune.key}
            </DialogDescription>
          </DialogHeader>

          <NotationNotice
            source={tune.notationSource}
            sourceUrl={tune.notationSourceUrl}
          />

          <AbcTune abc={tune.abcNotation} title={tune.title} rhythm={tune.rhythm} />

          {images.length > 0 && (
            <section aria-label="Manuscripts and photos" className="mt-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Manuscripts &amp; Photos
                </h3>
                <button
                  type="button"
                  onClick={() => openViewer(1)}
                  className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary transition-colors outline-none hover:text-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Maximize2 aria-hidden="true" className="size-4" />
                  View full screen
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => openViewer(i + 1)}
                    aria-label={`View ${img.caption ?? img.alt} full screen`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition-transform outline-none hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring/50"
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
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Images aria-hidden="true" className="size-3.5" />
                Prototype — placeholder images.
              </p>
            </section>
          )}

          <section aria-label="The story behind this tune" className="mt-2">
            <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
              The Story
            </h3>
            <TuneNarrative key={tune.id} text={tune.narrative} />
          </section>

          <section aria-label="Credits and archival details" className="mt-2">
            <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
              Credits &amp; Archive
            </h3>
            <dl className="space-y-1 text-base">
              {formatCredit('Composer', tune.credits.composer)}
              {formatCredit('Story by', tune.credits.storyBy)}
              {formatCredit('Editor', tune.credits.editor)}
              {formatCredit('Collection', tune.archivalMetadata.sourceCollection)}
              {formatCredit('Rights holder', tune.archivalMetadata.rightsHolder)}
              {formatCredit('Recording date', tune.archivalMetadata.recordingDate)}
            </dl>
          </section>
        </DialogContent>
      </Dialog>

      {images.length > 0 && (
        <TuneMediaViewer
          tune={tune}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          startIndex={viewerStart}
        />
      )}
    </>
  )
}
