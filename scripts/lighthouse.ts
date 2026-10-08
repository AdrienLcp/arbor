import { type ChildProcess, spawn, spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { chromium } from '@playwright/test'
import lighthouse, { type Config, type Flags } from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

/**
 * The landing, the demo family's tree and one of its sheets, on a phone and on
 * a desktop, in daylight and at night, score 100 in accessibility, best
 * practices and SEO, or the run fails. Performance is not gated: Arbor is a
 * family's tool, not a page competing for visitors.
 *
 * Lighthouse drives a Chromium launched here, through its debugging port:
 * `chrome-launcher` would make a profile it fails to delete on Windows. The
 * night pass is a flag on that browser, because Lighthouse opens its own tab
 * and no page-level emulation reaches it.
 *
 * `LIGHTHOUSE_BASE_URL` audits a deployment; otherwise the built web app is
 * served by the worker under `wrangler dev`, the way the end-to-end journeys
 * run it, with a state directory of its own so the demo family is built fresh.
 */

const ROOT = join(import.meta.dirname, '..')
const REPORT_DIR = join(ROOT, 'lighthouse-reports')
const WORKER_PORT = 8792
const PLAYWRIGHT_CHROMIUM_DEBUGGING_PORT = 9223

const SITE_ORIGIN = 'https://arbor.adrienlcp.com'
const DEMO_FAMILY_ID = 'demo-famille-morel-001'
const DEMO_FAMILY_KEY = 'public-demo-key-morel1'
const DEMO_FAMILY_PATH = `/f/${DEMO_FAMILY_ID}`
const HOME_PATH = '/'
const AUDITED_PATHS = [
  HOME_PATH,
  `${DEMO_FAMILY_PATH}/tree`,
  `${DEMO_FAMILY_PATH}/tree/auguste-morel`
]

const CATEGORIES = ['accessibility', 'best-practices', 'seo']
const MIN_SCORE = 100

/**
 * The quick pass: one screen, one theme. The full matrix stays in CI, since
 * contrast changes with the theme and the layout with the screen.
 */
const QUICK_FLAG = '--quick'

type FormFactor = 'desktop' | 'mobile'
type Scheme = 'dark' | 'light'

const BLINK_PREFERRED_COLOR_SCHEME: Record<Scheme, number> = {
  dark: 0,
  light: 1
}

const configFor: Record<FormFactor, Config | undefined> = {
  desktop: desktopConfig,
  mobile: undefined
}

/**
 * A fresh state directory has no demo yet: the first request to it builds the
 * family, photos included. Built under a Lighthouse trace, that first visit
 * leaves Chrome tracing, and the next audit fails with TRACING_ALREADY_STARTED
 * or never returns.
 */
const openDemoFamily = async (origin: string): Promise<void> => {
  const response = await fetch(`${origin}/api/families/${DEMO_FAMILY_ID}`, {
    headers: { Authorization: `Bearer ${DEMO_FAMILY_KEY}` }
  })

  if (!response.ok) {
    throw new Error(`The demo family answered ${response.status}`)
  }
}

const startLocalWorker = async (): Promise<{
  origin: string
  server: ChildProcess
}> => {
  const origin = `http://127.0.0.1:${WORKER_PORT}`
  const isPortTaken = await fetch(origin).then(
    () => true,
    () => false
  )

  if (isPortTaken) {
    throw new Error(
      `${origin} already answers: another server holds the port, and its pages would be audited instead of the build`
    )
  }

  const state = await mkdtemp(join(tmpdir(), 'arbor-lighthouse-'))
  const server = spawn(
    `pnpm --filter @arbor/worker exec wrangler dev --ip 127.0.0.1 --port ${WORKER_PORT} --persist-to ${state}`,
    {
      cwd: ROOT,
      detached: process.platform !== 'win32',
      shell: true,
      stdio: 'ignore'
    }
  )

  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      await fetch(origin)
      await openDemoFamily(origin)
      return { origin, server }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error(`The worker never answered on ${origin}`)
}

const stopServerProcessTree = (server: ChildProcess): void => {
  if (server.pid === undefined) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'])
  } else {
    process.kill(-server.pid)
  }
}

const audit = async (
  url: string,
  formFactor: FormFactor,
  categories: string[],
  skipAudits: string[]
): Promise<{ report: string; scores: Record<string, number> }> => {
  const flags: Flags = {
    logLevel: 'error',
    onlyCategories: categories,
    output: 'html',
    port: PLAYWRIGHT_CHROMIUM_DEBUGGING_PORT,
    skipAudits
  }
  const result = await lighthouse(url, flags, configFor[formFactor])

  if (result === undefined) {
    throw new Error(`Lighthouse returned nothing for ${url}`)
  }

  const runtimeError = result.lhr.runtimeError

  if (runtimeError !== undefined) {
    throw new Error(`${url}: ${runtimeError.code} ${runtimeError.message}`)
  }

  const scores = Object.fromEntries(
    categories.map((id) => [
      id,
      Math.round((result.lhr.categories[id]?.score ?? 0) * 100)
    ])
  )

  return { report: String(result.report), scores }
}

const reportNameFor = (path: string, formFactor: FormFactor, scheme: Scheme) =>
  `${path.slice(1).replaceAll('/', '-') || 'home'}.${formFactor}.${scheme}.html`

const baseUrl = process.env.LIGHTHOUSE_BASE_URL
const local = baseUrl === undefined ? await startLocalWorker() : undefined
const origin = baseUrl ?? local?.origin ?? ''
const failures: string[] = []
const quick = process.argv.includes(QUICK_FLAG)
const schemes: Scheme[] = quick ? ['light'] : ['light', 'dark']
const formFactors: FormFactor[] = quick ? ['desktop'] : ['mobile', 'desktop']

/**
 * A family's pages are `noindex` on purpose: SEO would rightly call them
 * uncrawlable, so they answer to the two other categories only. The landing
 * is indexed on the site's own origin alone, so anywhere else its crawlability
 * is not judged, but the rest of SEO is.
 */
const categoriesFor = (path: string): string[] =>
  path === HOME_PATH ? CATEGORIES : CATEGORIES.filter((id) => id !== 'seo')
const skippedAuditsFor = (path: string): string[] =>
  path === HOME_PATH && origin !== SITE_ORIGIN ? ['is-crawlable'] : []

try {
  const pathsNamedOnTheCommandLine = process.argv
    .slice(2)
    .filter((arg) => arg !== QUICK_FLAG)
  const paths = AUDITED_PATHS.filter(
    (path) =>
      pathsNamedOnTheCommandLine.length === 0 ||
      pathsNamedOnTheCommandLine.includes(path)
  )

  if (paths.length === 0) {
    throw new Error(
      `No page to audit: ${pathsNamedOnTheCommandLine.join(', ')} is not one of ${AUDITED_PATHS.join(', ')}`
    )
  }
  await mkdir(REPORT_DIR, { recursive: true })

  for (const scheme of schemes) {
    const browser = await chromium.launch({
      args: [
        `--remote-debugging-port=${PLAYWRIGHT_CHROMIUM_DEBUGGING_PORT}`,
        `--blink-settings=preferredColorScheme=${BLINK_PREFERRED_COLOR_SCHEME[scheme]}`
      ]
    })

    try {
      for (const formFactor of formFactors) {
        for (const path of paths) {
          const { report, scores } = await audit(
            `${origin}${path}`,
            formFactor,
            categoriesFor(path),
            skippedAuditsFor(path)
          )
          const broken = Object.entries(scores)
            .filter(([, score]) => score < MIN_SCORE)
            .map(([id, score]) => `${id} ${score}`)
          const label = `${path} ${formFactor} ${scheme}`

          console.info(
            `${broken.length === 0 ? 'ok  ' : 'FAIL'} ${label}${broken.length === 0 ? '' : ` · ${broken.join(', ')}`}`
          )

          if (broken.length > 0) {
            failures.push(`${label}: ${broken.join(', ')}`)
          }
          await writeFile(
            join(REPORT_DIR, reportNameFor(path, formFactor, scheme)),
            report
          )
        }
      }
    } finally {
      await browser.close()
    }
  }
} finally {
  if (local !== undefined) {
    stopServerProcessTree(local.server)
  }
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length} audit(s) under 100, reports in lighthouse-reports/:\n${failures.join('\n')}`
  )
  process.exit(1)
}

console.info(
  '\nEvery page scores 100 in accessibility, best practices and SEO, on both screens and in both themes.'
)
