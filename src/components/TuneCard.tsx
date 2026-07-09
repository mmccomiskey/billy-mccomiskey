import type { Tune } from '@/lib/types'

interface TuneCardProps {
  tune: Tune
  onOpen: (tune: Tune) => void
}

/**
 * A large, high-contrast tap target for a single tune. The whole card is one
 * button (min-height 96px) to be forgiving for older users and touch devices.
 */
export function TuneCard({ tune, onOpen }: TuneCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(tune)}
      className="group flex min-h-24 w-full items-center rounded-xl bg-card px-5 py-4 text-left ring-1 ring-foreground/10 transition-all outline-none hover:ring-2 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-px"
    >
      <span className="text-xl leading-snug font-bold tracking-wide text-card-foreground uppercase sm:text-2xl">
        {tune.title}{' '}
        <span className="font-heading text-muted-foreground capitalize italic">
          {tune.rhythm}
        </span>
      </span>
    </button>
  )
}
