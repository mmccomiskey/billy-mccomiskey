import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base is '/' because the site is served at the root of a custom domain
// (beta.billymccomiskey.com, later billymccomiskey.com), set via public/CNAME.
// On the old github.io project page this was '/billy-mccomiskey/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
