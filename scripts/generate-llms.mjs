#!/usr/bin/env node
/**
 * Generates the machine-readable discovery layer from the tune dataset so it
 * always stays in sync with `src/data/tunes.json` (the single source of truth).
 * Writes into `public/` (committed + dev-served); `vite build` then copies these
 * into `dist/` for deploy. Runs at the START of `npm run build` (before vite) and
 * via `npm run generate:llms`. No network, no cost — pure static generation.
 *
 * Outputs (under public/):
 *   - llms.txt              concise index: overview, schema, tune list, links
 *   - llms-full.txt         full catalog: tunes + discography metadata
 *   - .well-known/llms.txt  copy of the index (the path named in the proposal)
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

/**
 * Public base URL of the deployed site. When the archive moves to the apex
 * (https://billymccomiskey.com), change this one constant.
 */
const SITE = 'https://beta.billymccomiskey.com'

const tunes = JSON.parse(
  await readFile(join(root, 'src', 'data', 'tunes.json'), 'utf8')
)
const albums = JSON.parse(
  await readFile(join(root, 'src', 'data', 'albums.json'), 'utf8')
)

const OVERVIEW = `# Billy McComiskey — Original Compositions Archive

> A static, client-side digital archive of the original musical compositions of
> Billy McComiskey, NEA National Heritage Fellow and master Irish traditional
> accordionist. Each composition carries sheet music (ABC notation), playable
> audio, credits, and the historical story behind it.

This file is generated from the canonical dataset at build time, so it always
matches the live catalog. It is intended for machine consumers (LLMs, crawlers,
and archival ingest tools such as the Irish Traditional Music Archive, ITMA).`

const SCHEMA = `## Data model: \`Tune\`

| Field | Type | Description |
|---|---|---|
| \`id\` | string | URL-safe stable identifier (kebab-case). |
| \`title\` | string | Display title, e.g. "The Diamond". |
| \`rhythm\` | string | Tune type: \`reel\`, \`jig\`, \`slip jig\`, \`hornpipe\`, \`polka\`, \`slide\`, \`waltz\`, \`air\`, \`march\`, \`barndance\`. |
| \`key\` | string | Musical key, e.g. \`G\`, \`Dmaj\`, \`Amaj\`. |
| \`narrative\` | string | The historical story behind the composition. |
| \`credits\` | object | \`composer\`, optional \`storyBy\`, optional \`editor\`. |
| \`archivalMetadata\` | object | \`sourceCollection\`, \`rightsHolder\`, \`recordingDate\` — shaped to match ITMA ingest. |
| \`abcNotation\` | string | Standard ABC notation, rendered client-side via abcjs. |
| \`notationSource\` | string | Provenance of the notation: \`official\`, \`thesession\`, or \`placeholder\`. |`

const ALBUM_SCHEMA = `## Data model: \`Album\`

| Field | Type | Description |
|---|---|---|
| \`id\` | string | URL-safe stable identifier (kebab-case). |
| \`title\` | string | Album title. |
| \`year\` | number | Release year. |
| \`artist\` | string | Billing/artist name on the release. |
| \`role\` | string | Billy's role: \`solo\`, \`member\`, \`ensemble\`, or \`guest\`. |
| \`label\` | string | Record label. |
| \`personnel\` | string | Notable players (optional). |
| \`notes\` | string | Editorial context (optional). |
| \`links\` | object | Optional outbound links (\`bandcamp\`, \`spotify\`, \`appleMusic\`, \`compass\`, \`discogs\`, \`allmusic\`). |`

const LICENSE = `## License & attribution

Compositions © Billy McComiskey. Please retain composer and story credits when
reusing any material from this archive.`

/** First sentence of a narrative, for the one-line index summary. */
function firstSentence(text) {
  if (!text) return ''
  const match = text.match(/^.*?[.!?](\s|$)/)
  const s = (match ? match[0] : text).trim()
  return s.length > 160 ? `${s.slice(0, 157).trimEnd()}…` : s
}

function deepLink(id) {
  return `${SITE}/?tune=${id}`
}

// ---- llms.txt (concise index) ------------------------------------------------

const indexList = tunes
  .map((t) => {
    const flag = t.notationSource === 'placeholder' ? ' _(placeholder notation)_' : ''
    return `- [${t.title} (${t.rhythm}, ${t.key})](${deepLink(t.id)}) — ${firstSentence(t.narrative)}${flag}`
  })
  .join('\n')

const discographyList = [...albums]
  .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  .map(
    (a) =>
      `- ${a.year} — ${a.title} (${a.artist}; role: ${a.role}; label: ${a.label})`
  )
  .join('\n')

const llmsTxt = `${OVERVIEW}

## Compositions (${tunes.length})

${indexList}

## Full data

- Structured JSON (canonical): ${SITE}/data/tunes.json
- Structured JSON (discography): ${SITE}/data/albums.json
- Full catalog in markdown (stories + notation): ${SITE}/llms-full.txt

${SCHEMA}

## Discography (${albums.length})

${discographyList}

${ALBUM_SCHEMA}

${LICENSE}
`

// ---- llms-full.txt (full catalog) -------------------------------------------

function tuneSection(t) {
  const lines = [
    `## ${t.title}`,
    '',
    `- **Type:** ${t.rhythm}`,
    `- **Key:** ${t.key}`,
    `- **ID:** \`${t.id}\``,
    `- **Notation source:** ${t.notationSource}${t.notationSourceUrl ? ` (${t.notationSourceUrl})` : ''}`,
    `- **Composer:** ${t.credits?.composer ?? 'Billy McComiskey'}`,
  ]
  if (t.credits?.storyBy) lines.push(`- **Story by:** ${t.credits.storyBy}`)
  if (t.credits?.editor) lines.push(`- **Editor:** ${t.credits.editor}`)
  lines.push(
    `- **Collection:** ${t.archivalMetadata?.sourceCollection ?? ''}`,
    `- **Rights holder:** ${t.archivalMetadata?.rightsHolder ?? ''}`,
    `- **Recording date:** ${t.archivalMetadata?.recordingDate ?? 'n.d.'}`,
    `- **Link:** ${deepLink(t.id)}`,
    '',
    '### Story',
    '',
    t.narrative || '_No story recorded yet._',
    '',
    '### ABC notation',
    '',
    '```abc',
    t.abcNotation.trimEnd(),
    '```',
  )
  return lines.join('\n')
}

function albumLinkLines(links = {}) {
  const rows = Object.entries(links)
    .filter(([, url]) => Boolean(url))
    .map(([label, url]) => `  - ${label}: ${url}`)
  return rows.length ? rows : ['  - (none listed)']
}

function albumSection(a) {
  const lines = [
    `## ${a.title} (${a.year})`,
    '',
    `- **Artist:** ${a.artist}`,
    `- **Role:** ${a.role}`,
    `- **Label:** ${a.label}`,
    `- **ID:** \`${a.id}\``,
  ]
  if (a.personnel) lines.push(`- **Personnel:** ${a.personnel}`)
  if (a.notes) lines.push(`- **Notes:** ${a.notes}`)
  lines.push('', '### Links', '', ...albumLinkLines(a.links))
  return lines.join('\n')
}

const llmsFullTxt = `# Billy McComiskey — Original Compositions (Full Catalog)

> Complete, machine-readable catalog generated from the archive dataset. For the
> concise index and schema see ${SITE}/llms.txt; for structured data see
> ${SITE}/data/tunes.json and ${SITE}/data/albums.json.

${tunes.map(tuneSection).join('\n\n---\n\n')}

---

# Discography

${[...albums]
  .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  .map(albumSection)
  .join('\n\n---\n\n')}

${LICENSE}
`

// ---- write outputs -----------------------------------------------------------

await mkdir(join(publicDir, '.well-known'), { recursive: true })
await writeFile(join(publicDir, 'llms.txt'), llmsTxt)
await writeFile(join(publicDir, 'llms-full.txt'), llmsFullTxt)
await writeFile(join(publicDir, '.well-known', 'llms.txt'), llmsTxt)

console.log(
  `generate-llms: wrote llms.txt + llms-full.txt (${tunes.length} tunes) to public/`
)
