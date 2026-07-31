import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { truncateAtWord } from '@/lib/text'

interface TuneNarrativeProps {
  text: string
  /** Collapse the story when it runs longer than this many characters. */
  collapsedChars?: number
}

/**
 * The tune's story, collapsed to a "Read more" preview when long so the notation
 * and credits stay reachable without a wall of text. Short stories render in
 * full with no toggle. State is local, so give this a `key` per tune to reset
 * it when the modal switches tunes.
 */
export function TuneNarrative({ text, collapsedChars = 300 }: TuneNarrativeProps) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = text.length > collapsedChars
  const showFull = expanded || !needsToggle

  return (
    <>
      <p className="text-base leading-relaxed whitespace-pre-line text-foreground/90">
        {showFull ? text : `${truncateAtWord(text, collapsedChars)}…`}
      </p>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 rounded text-base font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
      )}
    </>
  )
}
