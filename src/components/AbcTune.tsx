import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import { Play, Square, Loader2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AbcTuneProps {
  abc: string
  title: string
  rhythm?: string
}

type PlayStatus = 'idle' | 'loading' | 'playing'

/**
 * Playback slowdown per rhythm. 1 = the tune's natural tempo; higher = slower.
 * Fast dance tunes (reels, jigs) are eased off so the melody is easy to follow
 * and learn from; airs and waltzes stay at their written tempo.
 * Tweak these to taste.
 */
const TEMPO_SLOWDOWN: Record<string, number> = {
  reel: 1.6,
  jig: 1.45,
  'slip jig': 1.45,
  hornpipe: 1.4,
  polka: 1.4,
  slide: 1.4,
  barndance: 1.4,
  march: 1.2,
}

function slowdownFor(rhythm?: string): number {
  if (!rhythm) return 1
  return TEMPO_SLOWDOWN[rhythm.toLowerCase()] ?? 1
}

/**
 * iOS/iPadOS silences the Web Audio API when the hardware silent switch is on,
 * so we surface a hint. (iPadOS reports as "MacIntel" but has touch points.)
 */
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

/**
 * Renders a tune as an infinite-resolution SVG staff (abcjs) and plays the
 * melody through the Web Audio API via abcjs's built-in synth. The SVG scales
 * responsively to its container so there's never a need to pinch-zoom.
 */
export function AbcTune({ abc, title, rhythm }: AbcTuneProps) {
  const notationRef = useRef<HTMLDivElement>(null)
  // abcjs visual object — typed as its TuneObject; kept in a ref for the synth.
  const visualObjRef = useRef<abcjs.TuneObject | null>(null)
  // CreateSynth has no exported type surface we need beyond these calls.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthRef = useRef<any>(null)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [status, setStatus] = useState<PlayStatus>('idle')
  const [audioSupported, setAudioSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!notationRef.current) return
    const rendered = abcjs.renderAbc(notationRef.current, abc, {
      responsive: 'resize',
      add_classes: true,
      staffwidth: 720,
      paddingtop: 8,
      paddingbottom: 8,
    })
    visualObjRef.current = rendered[0]
    setAudioSupported(abcjs.synth.supportsAudio())

    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
      if (synthRef.current) {
        synthRef.current.stop()
        synthRef.current = null
      }
      setStatus('idle')
    }
  }, [abc])

  function resetToIdle() {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = null
    setStatus('idle')
  }

  async function togglePlay() {
    if (status === 'playing') {
      synthRef.current?.stop()
      resetToIdle()
      return
    }
    if (!visualObjRef.current) return

    // iOS requires the AudioContext to be woken up synchronously inside the tap
    // handler, before any await. Use abcjs's shared context so we resume the
    // exact one it plays through.
    const audioContext = abcjs.synth.activeAudioContext()
    const resumed = audioContext.resume()

    setStatus('loading')
    setError(null)

    try {
      await resumed

      if (!synthRef.current) {
        const synth = new abcjs.synth.CreateSynth()
        const naturalMs = visualObjRef.current.millisecondsPerMeasure?.() ?? 500
        await synth.init({
          audioContext,
          visualObj: visualObjRef.current,
          millisecondsPerMeasure: naturalMs * slowdownFor(rhythm),
        })
        synthRef.current = synth
      }

      await synthRef.current.prime()
      await synthRef.current.start()
      setStatus('playing')

      // CreateSynth has no reliable "ended" event, so schedule a reset based
      // on the tune's total playback duration.
      const totalSeconds =
        (visualObjRef.current.getTotalTime?.() ?? 0) * slowdownFor(rhythm)
      if (totalSeconds > 0) {
        stopTimerRef.current = setTimeout(resetToIdle, totalSeconds * 1000 + 250)
      }
    } catch (err) {
      console.error('Tune playback failed', err)
      resetToIdle()
      setError(
        IS_IOS
          ? "Couldn't play the tune. On iPhone or iPad, check that the silent switch on the side of your device is turned off (no orange showing)."
          : "Couldn't play the tune in this browser. Please try again."
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={notationRef}
        className="overflow-x-auto rounded-xl bg-white p-3 [&_svg]:h-auto [&_svg]:max-w-full"
        aria-label={`Sheet music notation for ${title}`}
        role="img"
      />

      {audioSupported ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={status === 'playing'}
          disabled={status === 'loading'}
          className={cn(
            'inline-flex h-14 items-center justify-center gap-3 rounded-full px-8 text-lg font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/60 disabled:opacity-70',
            status === 'playing'
              ? 'bg-destructive text-primary-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/85'
          )}
        >
          {status === 'loading' && (
            <>
              <Loader2 aria-hidden="true" className="size-6 animate-spin" />
              Loading…
            </>
          )}
          {status === 'playing' && (
            <>
              <Square aria-hidden="true" className="size-6" />
              Stop
            </>
          )}
          {status === 'idle' && (
            <>
              <Play aria-hidden="true" className="size-6" />
              Play Tune
            </>
          )}
        </button>
      ) : (
        <p className="inline-flex items-center gap-2 text-base text-muted-foreground">
          <VolumeX aria-hidden="true" className="size-5" />
          Audio playback isn&apos;t supported in this browser.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-base text-amber-900 dark:text-amber-200"
        >
          <VolumeX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {error}
        </p>
      )}

      {audioSupported && !error && IS_IOS && (
        <p className="text-sm text-muted-foreground">
          On iPhone or iPad, if you don&apos;t hear anything, flip the silent
          switch on the side of your device off.
        </p>
      )}
    </div>
  )
}
