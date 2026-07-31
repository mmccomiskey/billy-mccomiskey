/**
 * Feedback endpoint for the Billy McComiskey archive.
 *
 * The About-page form POSTs here and this Worker creates a GitHub issue, so
 * visitors never leave the site. Runs on beta.billymccomiskey.com/api/feedback
 * (same-origin with the app, which is proxied through Cloudflare).
 *
 * Service-worker format on purpose: bound secrets/vars are available as globals
 * (GITHUB_TOKEN, GITHUB_REPO), so no build step is needed.
 *
 * Bindings (set with wrangler or in the dashboard):
 *   - GITHUB_TOKEN  (secret)  fine-grained PAT with Issues: read/write on the repo
 *   - GITHUB_REPO   (var)     "owner/name", e.g. mmccomiskey/billy-mccomiskey
 *
 * Spam protection (v1): a honeypot field. Turnstile is the planned hardening
 * (see issue #14).
 */
const CATEGORIES = new Set(['correction', 'bug', 'suggestion'])
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
}

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request))
})

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS },
  })
}

async function handle(request) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }

  const name = String(body?.name ?? '').trim().slice(0, 120)
  const category = String(body?.category ?? '').trim()
  const message = String(body?.message ?? '').trim()
  const honeypot = String(body?.website ?? '') // must stay empty for real humans

  // Bot filled the hidden field — pretend success, create nothing.
  if (honeypot) return json({ ok: true })

  if (message.length < 3) return json({ error: 'Please enter a message.' }, 400)
  if (message.length > 5000) return json({ error: 'Message is too long.' }, 400)

  const token = typeof GITHUB_TOKEN !== 'undefined' ? GITHUB_TOKEN : null
  if (!token) return json({ error: 'Feedback is not configured yet.' }, 503)
  const repo =
    typeof GITHUB_REPO !== 'undefined' && GITHUB_REPO
      ? GITHUB_REPO
      : 'mmccomiskey/billy-mccomiskey'

  const cat = CATEGORIES.has(category) ? category : null
  const title = `[${cat ?? 'feedback'}] Feedback from ${name || 'a visitor'}`.slice(0, 200)
  const issueBody = [
    `**Type:** ${cat ?? '(unspecified)'}`,
    `**From:** ${name || '(not provided)'}`,
    '',
    message,
    '',
    '_Submitted via the site feedback form._',
  ].join('\n')
  const labels = cat ? ['feedback', cat] : ['feedback']

  const gh = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': 'billymccomiskey-feedback-worker',
    },
    body: JSON.stringify({ title, body: issueBody, labels }),
  })

  if (!gh.ok) {
    return json({ error: 'Could not submit right now. Please try again later.' }, 502)
  }
  const issue = await gh.json()
  return json({ ok: true, url: issue.html_url, number: issue.number })
}
