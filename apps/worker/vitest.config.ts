import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

/** The API suite boots workerd, which restarts slowly on Windows: the default 10 s fails its hooks. */
const WORKER_HARNESS_HOOK_TIMEOUT_MS = 60_000

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  test: {
    hookTimeout: WORKER_HARNESS_HOOK_TIMEOUT_MS,
    include: ['src/**/*.test.ts'],
    name: 'worker'
  }
})
