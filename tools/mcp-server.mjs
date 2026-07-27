#!/usr/bin/env node
/**
 * Local Model Context Protocol (MCP) data-tool provider for the Billy
 * McComiskey archive. It exposes read-only tools over `public/data/tunes.json`
 * so coding agents can verify changes against the real dataset during local
 * development.
 *
 * Run with: npm run mcp   (communicates over stdio)
 *
 * Tools:
 *   - get_all_tunes         list every composition
 *   - get_tune              fetch a single composition by id
 *   - render_interactive_tune  return ABC notation + metadata for a tune
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TUNES_PATH = join(__dirname, '..', 'src', 'data', 'tunes.json')

async function loadTunes() {
  const raw = await readFile(TUNES_PATH, 'utf8')
  return JSON.parse(raw)
}

const TOOLS = [
  {
    name: 'get_all_tunes',
    description:
      'Return the full array of Billy McComiskey compositions from the archive dataset.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_tune',
    description: 'Return a single composition by its id (kebab-case).',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The tune id, e.g. "the-diamond".' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'render_interactive_tune',
    description:
      'Return the ABC notation and key metadata for a tune so an agent can verify notation or rendering changes.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The tune id, e.g. "ohms-law".' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
]

function textResult(payload) {
  return {
    content: [
      {
        type: 'text',
        text:
          typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      },
    ],
  }
}

function errorResult(message) {
  return { content: [{ type: 'text', text: message }], isError: true }
}

const server = new Server(
  { name: 'billy-mccomiskey-archive', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const tunes = await loadTunes()

  switch (name) {
    case 'get_all_tunes':
      return textResult(tunes)

    case 'get_tune': {
      const tune = tunes.find((t) => t.id === args?.id)
      return tune
        ? textResult(tune)
        : errorResult(`No tune found with id "${args?.id}".`)
    }

    case 'render_interactive_tune': {
      const tune = tunes.find((t) => t.id === args?.id)
      if (!tune) return errorResult(`No tune found with id "${args?.id}".`)
      return textResult({
        id: tune.id,
        title: tune.title,
        rhythm: tune.rhythm,
        key: tune.key,
        abcNotation: tune.abcNotation,
      })
    }

    default:
      return errorResult(`Unknown tool: ${name}`)
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
// Use stderr so we never corrupt the stdio JSON-RPC stream.
console.error('billy-mccomiskey-archive MCP server running on stdio')
