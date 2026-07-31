import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Unit tests cover pure helpers (no DOM needed). E2E lives in ./e2e (Playwright).
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
