import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_EMAIL } from '@/lib/config'

/** Same-origin Worker endpoint (see cloudflare/feedback-worker). */
const FEEDBACK_ENDPOINT = '/api/feedback'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is this archive?',
    a: 'A digital home for the original musical compositions of Billy McComiskey, NEA National Heritage Fellow and master Irish traditional accordionist. Each tune includes sheet music, playable audio, and the story behind it.',
  },
  {
    q: 'How do I listen to a tune?',
    a: 'Tap any tune card to open it. You will see the sheet music and a large “Play Tune” button that plays the melody right in your browser — no app or account needed.',
  },
  {
    q: 'Can I make the notation bigger?',
    a: 'The sheet music is drawn as crisp vector graphics, so you can use your browser or device zoom to enlarge everything without it turning blurry.',
  },
  {
    q: 'I found a mistake in a tune or a story. What should I do?',
    a: 'Please tell us using the form below. Corrections to notation, titles, dates, and stories are always welcome.',
  },
]

const CATEGORIES = [
  { value: 'correction', label: 'A text or notation correction' },
  { value: 'bug', label: 'Something is broken (a bug)' },
  { value: 'suggestion', label: 'A suggestion or idea' },
] as const

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function AboutView() {
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]['value']>('correction')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot — real people leave it empty
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const canSubmit = message.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting' || !canSubmit) return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, category, message, website }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatus('success')
        setName('')
        setMessage('')
      } else {
        setStatus('error')
        setErrorMsg(
          data.error || 'Something went wrong. Please try again in a moment.'
        )
      }
    } catch {
      setStatus('error')
      setErrorMsg(
        `Couldn't reach the server. Please try again, or email ${CONTACT_EMAIL}.`
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <section aria-labelledby="about-heading">
        <h1
          id="about-heading"
          className="font-heading mb-4 text-center text-3xl font-semibold text-foreground sm:text-4xl"
        >
          About
        </h1>
        <p className="text-base leading-relaxed text-foreground/90">
          Billy McComiskey is an NEA National Heritage Fellow and one of the
          most influential Irish button accordionists in America. This archive
          gathers his original compositions — the tunes, the sheet music, and
          the stories behind each one — in one accessible place, free for
          players and listeners everywhere.
        </p>
      </section>

      <section aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="font-heading mb-4 text-2xl font-semibold text-foreground"
        >
          Help &amp; FAQ
        </h2>
        <dl className="flex flex-col gap-5">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <dt className="mb-1 text-lg font-semibold text-foreground">
                {q}
              </dt>
              <dd className="text-base leading-relaxed text-muted-foreground">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="feedback-heading">
        <h2
          id="feedback-heading"
          className="font-heading mb-2 text-2xl font-semibold text-foreground"
        >
          Send Feedback
        </h2>

        {status === 'success' ? (
          <div className="rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto size-9 text-primary"
            />
            <p className="mt-3 text-lg font-semibold text-foreground">
              Thanks, that&apos;s been sent.
            </p>
            <p className="mt-1 text-base text-muted-foreground">
              We read every note. Appreciate you taking the time.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-4 rounded text-base font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Send more feedback
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-base text-muted-foreground">
              Spotted a mistake or have an idea? Send it straight to the archive
              — no account needed.
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fb-category"
                  className="text-base font-semibold text-foreground"
                >
                  What kind of feedback is this?
                </label>
                <select
                  id="fb-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as (typeof CATEGORIES)[number]['value']
                    )
                  }
                  className="h-12 rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fb-name"
                  className="text-base font-semibold text-foreground"
                >
                  Your name (optional)
                </label>
                <input
                  id="fb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="h-12 rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fb-message"
                  className="text-base font-semibold text-foreground"
                >
                  Your message
                </label>
                <textarea
                  id="fb-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you noticed…"
                  className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px' }}
              >
                <label htmlFor="fb-website">Leave this field empty</label>
                <input
                  id="fb-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {status === 'error' && (
                <p
                  role="alert"
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-base text-amber-900 dark:text-amber-200"
                >
                  {errorMsg}
                </p>
              )}

              <Button
                type="submit"
                disabled={!canSubmit || status === 'submitting'}
                className="h-12 gap-2 text-base"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" className="size-5" />
                    Send feedback
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                Prefer email? Write to{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
