/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // send /api calls to Express, both in dev and in `npm run preview` of the build
  server: { proxy: { '/api': 'http://localhost:5050' } },
  preview: { proxy: { '/api': 'http://localhost:5050' } },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }
})
