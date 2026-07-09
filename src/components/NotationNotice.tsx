import { AlertTriangle, Info } from 'lucide-react'
import type { Tune } from '@/lib/types'

/**
 * Honest provenance banner for a tune's notation. Nothing is shown for
 * `official` (verified) notation.
 */
export function NotationNotice({
  source,
  sourceUrl,
}: {
  source: Tune['notationSource']
  sourceUrl?: string
}) {
  if (source === 'official') return null

  if (source === 'placeholder') {
    return (
      <div
        role="note"
        className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-base text-amber-900 dark:text-amber-200"
      >
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>
          <strong>Placeholder notation.</strong> This is stand-in music, not
          Billy&apos;s actual tune yet — please don&apos;t learn from it. The
          real transcription is coming soon.
        </p>
      </div>
    )
  }

  // source === 'thesession'
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-base text-foreground/90"
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <p>
        Community transcription from{' '}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            thesession.org
          </a>
        ) : (
          'thesession.org'
        )}
        , pending Billy&apos;s sign-off.
      </p>
    </div>
  )
}
