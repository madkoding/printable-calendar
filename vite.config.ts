/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fetchIcs, IcsFetchError } from './api/_lib/fetchIcs.js'

function icalProxyDevPlugin(): Plugin {
  return {
    name: 'ical-proxy-dev',
    configureServer(server) {
      server.middlewares.use('/api/ical-proxy', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost').searchParams.get('url')
        if (!url) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing url parameter' }))
          return
        }
        try {
          const text = await fetchIcs(url)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
          res.end(text)
        } catch (err) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          const message = err instanceof IcsFetchError ? err.message : 'Failed to fetch calendar'
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), icalProxyDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  build: {
    chunkSizeWarningLimit: 1300,
  },
})
