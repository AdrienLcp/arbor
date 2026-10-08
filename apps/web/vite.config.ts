import { resolve } from 'node:path'

import { themePreferencePlugin } from '@adrienlcp/theme-preference/vite'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import fontaine from 'fontaine/postcss'
import { defineConfig } from 'vite'

import { API_PREFIX } from '../../packages/protocol/src/routes.ts'
import { arialMetricTwins } from './arial-metric-twins.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'
import { themeStore } from './src/presentation/theme/theme-store.ts'

const WORKER_ORIGIN = 'http://127.0.0.1:8790'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        fontaine({
          fallbacks: ['Arial'],
          resolvePath: (path) => new URL(`./public${path}`, import.meta.url)
        }),
        arialMetricTwins
      ]
    }
  },
  plugins: [
    {
      ...optimizeLocales.vite({ locales: Object.values(REGIONAL_LOCALES) }),
      // Swaps a dropped locale's module in resolveId, which only works ahead of Vite's resolver.
      enforce: 'pre'
    },
    react({ compiler: { logDiagnostics: true } }),
    themePreferencePlugin(themeStore)
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5520,
    // Same origin in dev as in production, where the worker serves both.
    proxy: {
      [API_PREFIX]: { changeOrigin: true, target: WORKER_ORIGIN }
    },
    strictPort: true
  }
})
