import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base is '/billy-mccomiskey/' for the github.io project page
// (https://mmccomiskey.github.io/billy-mccomiskey/). If you later point a custom
// domain (e.g. billymccomiskey.com) at Pages, add a public/CNAME file and change
// this back to '/'.
export default defineConfig({
  base: '/billy-mccomiskey/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
