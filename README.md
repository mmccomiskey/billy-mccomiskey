# Billy McComiskey — Original Compositions Archive

A static, ultra-accessible React web app housing the original compositions of
**Billy McComiskey**, NEA National Heritage Fellow and master Irish traditional
accordionist. Fully client-side, deployable to GitHub Pages for $0/month.

## Stack

- **Vite** + **React 19** + **TypeScript** (strict, ESM)
- **Tailwind CSS v4** (CSS-first `@theme` config) — forest green / gold / cream
- **shadcn/ui** on **Radix Primitives** (WAI-ARIA, VoiceOver / TalkBack friendly)
- **abcjs** — client-side SVG sheet-music rendering + Web Audio playback

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run lint       # oxlint
npm run mcp        # start the local MCP data-tool server (stdio)
```

## Project structure

```
public/
  data/tunes.json          master composition dataset (the source of truth)
  .well-known/llms.txt     data-model docs for machines / archival ingest
  favicon.svg
src/
  App.tsx                  app shell: header + nav + view routing
  main.tsx
  index.css                Tailwind v4 theme (forest green / gold / cream)
  components/
    ui/                    shadcn primitives (button, card, input, dialog)
    AppLogo.tsx            gold "BILLY McCOMISKEY" wordmark
    SiteHeader.tsx         header + search capsule
    Navigation.tsx         desktop sidebar + mobile bottom tab bar
    TuneCard.tsx           large tap-target tune card
    TuneModal.tsx          detail dialog (notation + story + credits)
    AbcTune.tsx            abcjs SVG rendering + Play button (Web Audio)
  views/
    TunesView.tsx          flat card list + search
    AlbumsView.tsx         placeholder
    AboutView.tsx          FAQ + feedback form (GitHub Issues / mailto)
  lib/
    types.ts               Tune data model
    useTunes.ts            fetches public/data/tunes.json
    nav.ts                 nav config
    config.ts              GitHub repo + contact email (EDIT THESE)
    utils.ts               cn()
tools/
  mcp-server.mjs           local MCP provider: get_all_tunes, get_tune, render_interactive_tune
```

## Data model

See [`public/.well-known/llms.txt`](public/.well-known/llms.txt) for the full
`Tune` / `Credits` / `ArchivalMetadata` schema.

## Deployment (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
`dist/` to GitHub Pages. For a custom domain, add a `public/CNAME` file and keep
`base: '/'` in `vite.config.ts`; for a bare project page, set `base` to
`'/billy-mccomiskey/'`.

## Before going live — TODO

- Set `GITHUB_REPO` and `CONTACT_EMAIL` in `src/lib/config.ts`.
- Replace the placeholder ABC notation in `tunes.json` with Billy's real
  transcriptions.
- Add the remaining compositions (44+) and album/discography data.
- Add `public/CNAME` if using a custom domain.
