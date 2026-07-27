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

  return (
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

        <AbcTune
          abc={tune.abcNotation}
          title={tune.title}
          rhythm={tune.rhythm}
        />

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
  )
}
