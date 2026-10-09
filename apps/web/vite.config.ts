import { resolve } from 'node:path'

import { metricTwins } from '@adrienlcp/styles/metric-twins'
import { themePreferencePlugin } from '@adrienlcp/theme-preference/vite'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import fontaine from 'fontaine/postcss'
import { defineConfig } from 'vite'

import { API_PREFIX } from '../../packages/protocol/src/routes.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'
import { SCREEN_SIZES } from './src/presentation/styles/screen-sizes.ts'
import { themeStore } from './src/presentation/theme/theme-store.ts'

/** `_fonts.sass` writes these per weight band, with `fonts.fallback-faces`. */
const FALLBACK_FACES_WRITTEN_BY_HAND = new Set([
  'Atkinson Hyperlegible fallback',
  'Barlow Condensed fallback'
])

const WORKER_ORIGIN = 'http://127.0.0.1:8790'

const SCREEN_SIZES_MODULE = new URL('arbor:screen-sizes')

/** Hands `_layout.sass` the breakpoints the scripts' media queries read, from their one source. */
const screenSizesImporter = {
  canonicalize: (url: string): URL | null =>
    url === SCREEN_SIZES_MODULE.href ? SCREEN_SIZES_MODULE : null,
  load: () => ({
    contents: [
      `$wide-screen: ${SCREEN_SIZES.wideScreen}`,
      `$short-screen: ${SCREEN_SIZES.shortScreen}`
    ].join('\n'),
    syntax: 'indented' as const
  })
}

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        fontaine({
          fallbacks: ['Arial'],
          resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
          skipFontFaceGeneration: (fallbackName) =>
            FALLBACK_FACES_WRITTEN_BY_HAND.has(fallbackName)
        }),
        metricTwins()
      ]
    },
    preprocessorOptions: {
      sass: { importers: [screenSizesImporter] }
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
