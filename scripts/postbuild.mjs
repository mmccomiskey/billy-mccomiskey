#!/usr/bin/env node
/**
 * Post-build steps for the static Pages deploy:
 *  1. Publish a copy of the bundled dataset to dist/data/tunes.json so external
 *     consumers (ITMA ingest, crawlers, the MCP tool) still have a stable URL.
 *  2. Copy dist/index.html to dist/404.html so client-side (path) routing
 *     survives deep-links and refreshes on GitHub Pages, which serves 404.html
 *     for unknown paths. index.html's asset URLs are absolute (under the base),
 *     so the SPA boots correctly no matter which path was requested.
 */
import { mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

await mkdir(join(dist, 'data'), { recursive: true })
await copyFile(
  join(root, 'src', 'data', 'tunes.json'),
  join(dist, 'data', 'tunes.json')
)
await copyFile(join(dist, 'index.html'), join(dist, '404.html'))

console.log('postbuild: published dist/data/tunes.json and dist/404.html')
