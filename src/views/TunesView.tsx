import { useMemo, useState } from 'react'
import type { Tune } from '@/lib/types'
import { TuneCard } from '@/components/TuneCard'
import { TuneModal } from '@/components/TuneModal'

interface TunesViewProps {
  tunes: Tune[]
  loading: boolean
  error: string | null
  query: string
}

function matchesQuery(tune: Tune, q: string): boolean {
  if (!q) return true
  const haystack =
    `${tune.title} ${tune.rhythm} ${tune.key} ${tune.narrative}`.toLowerCase()
  return haystack.includes(q.toLowerCase())
}

export function TunesView({ tunes, loading, error, query }: TunesViewProps) {
  const [selected, setSelected] = useState<Tune | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(
    () => tunes.filter((t) => matchesQuery(t, query.trim())),
    [tunes, query]
  )

  function handleOpen(tune: Tune) {
    setSelected(tune)
    setOpen(true)
  }

  return (
    <section aria-labelledby="tunes-heading">
      <h1
        id="tunes-heading"
        className="font-heading mb-6 text-center text-3xl font-semibold text-foreground sm:text-4xl"
      >
        Tune Book
      </h1>

      {loading && (
        <p className="text-center text-base text-muted-foreground">
          Loading tunes…
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-4 text-center text-base text-destructive"
        >
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-base text-muted-foreground">
          No tunes match “{query}”.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((tune) => (
          <TuneCard key={tune.id} tune={tune} onOpen={handleOpen} />
        ))}
      </div>

      <TuneModal tune={selected} open={open} onOpenChange={setOpen} />
    </section>
  )
}
