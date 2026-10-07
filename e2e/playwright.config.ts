import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { defineConfig, devices } from '@playwright/test'

/** Its own port, never the dev stack's 8790: a journey must not land on a family someone is using. */
const WORKER_PORT = 8791

/** `127.0.0.1`, not `localhost`: the readiness probe resolves `localhost` to `::1` first and never falls back. */
const APP_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${WORKER_PORT}`

/** A state directory of the run's own, or a family from the last run would still be there. */
const WORKER_STATE = mkdtempSync(join(tmpdir(), 'arbor-e2e-'))

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  outputDir: './test-results',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Pinned: the locators read accessible names, and those are translated.
        locale: 'en-US'
      }
    }
  ],
  reporter: 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: '.',
  timeout: 60_000,
  use: { baseURL: APP_URL, trace: 'retain-on-failure' },
  // The worker serves the built pages as in production, and every journey crosses its Durable Object.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: [
          'pnpm --filter @arbor/web exec vite build',
          '&& pnpm --filter @arbor/worker exec wrangler dev',
          `--ip 127.0.0.1 --port ${WORKER_PORT}`,
          `--persist-to ${WORKER_STATE}`
        ].join(' '),
        reuseExistingServer: false,
        timeout: 180_000,
        url: APP_URL
      }
})
