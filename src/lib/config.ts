/**
 * Site-wide configuration. Update these once the GitHub repository and contact
 * address are finalized.
 */

export const GITHUB_REPO = 'mmccomiskey/billy-mccomiskey'

// TODO: set to the real inbox that should receive feedback as an email fallback.
export const CONTACT_EMAIL = 'archive@billymccomiskey.com'

/** Builds a prefilled "New issue" URL so feedback lands in GitHub Issues. */
export function buildGithubIssueUrl(opts: {
  title: string
  body: string
  labels?: string[]
}): string {
  const params = new URLSearchParams({
    title: opts.title,
    body: opts.body,
  })
  if (opts.labels?.length) params.set('labels', opts.labels.join(','))
  return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`
}

/** Builds a mailto: fallback URL for the same feedback payload. */
export function buildMailtoUrl(opts: { subject: string; body: string }): string {
  const params = new URLSearchParams({
    subject: opts.subject,
    body: opts.body,
  })
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`
}
