import { useCallback, useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import {
  ChevronLeft,
  ChevronRight,
  Music4,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react'
import type { Tune, TuneImage } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface TuneMediaViewerProps {
  tune: Tune
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Which slide to open on. 0 = the engraved sheet music. */
  startIndex?: number
}

type Slide =
  | { kind: 'notation'; caption: string }
  | { kind: 'image'; image: TuneImage; caption: string }

interface Transform {
  scale: number
  tx: number
  ty: number
}

const IDENTITY: Transform = { scale: 1, tx: 0, ty: 0 }
const MIN_SCALE = 1
const MAX_SCALE = 5
const SWIPE_THRESHOLD = 60

function buildSlides(tune: Tune): Slide[] {
  const notation: Slide = { kind: 'notation', caption: 'Engraved sheet music' }
  const images = (tune.images ?? []).map<Slide>((image) => ({
    kind: 'image',
    image,
    caption: image.caption ?? image.alt,
  }))
  return [notation, ...images]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** abcjs-rendered staff, sized naturally; the stage scales it on zoom. */
function NotationSlide({ tune }: { tune: Tune }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    abcjs.renderAbc(ref.current, tune.abcNotation, {
      responsive: 'resize',
      add_classes: true,
      staffwidth: 800,
      paddingtop: 16,
      paddingbottom: 16,
    })
  }, [tune.abcNotation])
  return (
    <div className="w-full max-w-3xl rounded-xl bg-white p-4 shadow-lg [&_svg]:h-auto [&_svg]:max-w-full">
      <div ref={ref} role="img" aria-label={`Sheet music for ${tune.title}`} />
    </div>
  )
}

/**
 * Full-screen media viewer for a tune: pages through the engraved notation plus
 * any manuscript scans / photos, with pinch-, wheel-, and button-zoom (plus
 * drag-to-pan when zoomed). Swipe or arrow keys page between slides at 1x.
 */
export function TuneMediaViewer({
  tune,
  open,
  onOpenChange,
  startIndex = 0,
}: TuneMediaViewerProps) {
  const slides = buildSlides(tune)
  const [index, setIndex] = useState(startIndex)
  const [t, setT] = useState<Transform>(IDENTITY)
  const [dragging, setDragging] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  // Live pointer positions, keyed by pointerId, for pan + pinch math.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinch = useRef<{ dist: number; mx: number; my: number } | null>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  const reset = useCallback(() => setT(IDENTITY), [])

  // Reset zoom whenever the slide changes or the viewer (re)opens.
  useEffect(() => {
    reset()
  }, [index, open, reset])

  // Snap to the requested slide each time the viewer is opened.
  useEffect(() => {
    if (open) setIndex(startIndex)
  }, [open, startIndex])

  const goTo = useCallback(
    (next: number) => setIndex(clamp(next, 0, slides.length - 1)),
    [slides.length]
  )

  // Keep the (scaled) slide within the stage bounds.
  const clampPan = useCallback((x: number, y: number, scale: number) => {
    const el = stageRef.current
    if (!el) return { x, y }
    const { width, height } = el.getBoundingClientRect()
    return {
      x: clamp(x, width * (1 - scale), 0),
      y: clamp(y, height * (1 - scale), 0),
    }
  }, [])

  // Zoom toward a point (px,py) in stage-local coordinates.
  const zoomTo = useCallback(
    (rawScale: number, px: number, py: number) => {
      setT((prev) => {
        const scale = clamp(rawScale, MIN_SCALE, MAX_SCALE)
        if (scale === prev.scale) return prev
        const ratio = scale / prev.scale
        const rawX = px - (px - prev.tx) * ratio
        const rawY = py - (py - prev.ty) * ratio
        const { x, y } = clampPan(rawX, rawY, scale)
        return { scale, tx: x, ty: y }
      })
    },
    [clampPan]
  )

  const stageLocal = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect()
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) }
  }

  const zoomStep = useCallback(
    (factor: number) => {
      const rect = stageRef.current?.getBoundingClientRect()
      zoomTo(t.scale * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2)
    },
    [t.scale, zoomTo]
  )

  // ----- pointer gestures -----------------------------------------------
  function onPointerDown(e: React.PointerEvent) {
    // Presses on the overlaid controls (prev/next, zoom) must reach those
    // buttons: capturing the pointer here would swallow their click.
    if ((e.target as HTMLElement).closest('button')) return
    stageRef.current?.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1 && t.scale === 1) {
      swipeStart.current = { x: e.clientX, y: e.clientY }
    }
    if (pointers.current.size === 2) {
      swipeStart.current = null
      pinch.current = null
    }
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return
    const prev = pointers.current.get(e.pointerId)!
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const midClient = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const mid = stageLocal(midClient.x, midClient.y)
      if (pinch.current) {
        const factor = dist / pinch.current.dist
        const dMidX = midClient.x - pinch.current.mx
        const dMidY = midClient.y - pinch.current.my
        setT((cur) => {
          const scale = clamp(cur.scale * factor, MIN_SCALE, MAX_SCALE)
          const ratio = scale / cur.scale
          const rawX = mid.x - (mid.x - cur.tx) * ratio + dMidX
          const rawY = mid.y - (mid.y - cur.ty) * ratio + dMidY
          const { x, y } = clampPan(rawX, rawY, scale)
          return { scale, tx: x, ty: y }
        })
      }
      pinch.current = { dist, mx: midClient.x, my: midClient.y }
      return
    }

    // single pointer → pan when zoomed in
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    setT((cur) => {
      if (cur.scale === 1) return cur
      const { x, y } = clampPan(cur.tx + dx, cur.ty + dy, cur.scale)
      return { ...cur, tx: x, ty: y }
    })
  }

  function endPointer(e: React.PointerEvent) {
    // A single-pointer gesture that started at 1x and never became a pinch is
    // a swipe: page left/right.
    if (
      swipeStart.current &&
      pinch.current === null &&
      pointers.current.size === 1
    ) {
      const dx = e.clientX - swipeStart.current.x
      const dy = e.clientY - swipeStart.current.y
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        goTo(index + (dx < 0 ? 1 : -1))
      }
    }
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) {
      swipeStart.current = null
      setDragging(false)
    }
  }

  function onWheel(e: React.WheelEvent) {
    const p = stageLocal(e.clientX, e.clientY)
    zoomTo(t.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), p.x, p.y)
  }

  // ----- keyboard --------------------------------------------------------
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'ArrowRight') goTo(index + 1)
      else if (e.key === '+' || e.key === '=') zoomStep(1.25)
      else if (e.key === '-') zoomStep(1 / 1.25)
      else if (e.key === '0') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, goTo, zoomStep, reset])

  const slide = slides[index]
  const atStart = index === 0
  const atEnd = index === slides.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background/98 p-0"
      >
        <DialogTitle className="sr-only">
          {tune.title} — sheet music and images
        </DialogTitle>
        <DialogDescription className="sr-only">
          Page through the engraved notation and manuscript images. Pinch,
          scroll, or use the buttons to zoom; drag to pan; swipe or use the
          arrow keys to move between slides.
        </DialogDescription>

        {/* Stage */}
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={onWheel}
          className="relative flex-1 touch-none overflow-hidden select-none"
          style={{ cursor: t.scale > 1 ? 'grab' : 'default' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
            style={{
              transform: `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})`,
              transformOrigin: '0 0',
              transition: dragging ? 'none' : 'transform 120ms ease-out',
            }}
          >
            {slide.kind === 'notation' ? (
              <NotationSlide tune={tune} />
            ) : (
              <img
                src={slide.image.src}
                alt={slide.image.alt}
                draggable={false}
                className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
              />
            )}
          </div>

          {/* Prev / next */}
          {!atStart && (
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
              className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur transition-colors outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          {!atEnd && (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next"
              className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur transition-colors outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-card/85 p-1 shadow-md backdrop-blur">
            <button
              type="button"
              onClick={() => zoomStep(1 / 1.25)}
              disabled={t.scale <= MIN_SCALE}
              aria-label="Zoom out"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
            >
              <Minus className="size-5" />
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset zoom"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomStep(1.25)}
              disabled={t.scale >= MAX_SCALE}
              aria-label="Zoom in"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        {/* Caption + counter + thumbnails */}
        <div className="shrink-0 border-t border-border bg-card/95 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="truncate text-sm text-muted-foreground">
              {slide.caption}
            </p>
            <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
              {index + 1} / {slides.length}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {slides.map((s, i) => (
              <button
                key={s.kind === 'image' ? s.image.src : 'notation'}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.caption}`}
                aria-current={i === index}
                className={cn(
                  'grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border-2 bg-muted transition-colors',
                  i === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                )}
              >
                {s.kind === 'notation' ? (
                  <Music4 className="size-6 text-muted-foreground" />
                ) : (
                  <img
                    src={s.image.src}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
