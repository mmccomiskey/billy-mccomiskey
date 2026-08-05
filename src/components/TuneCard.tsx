import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Tune } from '@/lib/types'

interface TuneCardProps {
  tune: Tune
}

/**
 * A large, high-contrast tap target for a single tune. The whole card links to
 * the tune's page (min-height 96px) to be forgiving for older users and touch
 * devices. A trailing chevron signals it opens a detail view (always visible,
 * so the affordance reads on touch where there's no hover).
 */
export function TuneCard({ tune }: TuneCardProps) {
  return (
    <Link
      to={`/tunes/${tune.id}`}
      className="group flex min-h-24 w-full items-center justify-between gap-3 rounded-xl bg-card px-5 py-4 text-left ring-1 ring-foreground/10 transition-all outline-none hover:ring-2 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-px"
    >
      <span className="text-xl leading-snug font-bold tracking-wide text-card-foreground uppercase sm:text-2xl">
        {tune.title}{' '}
        <span className="font-heading text-muted-foreground capitalize italic">
          {tune.rhythm}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-6 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
      />
    </Link>
  )
}
