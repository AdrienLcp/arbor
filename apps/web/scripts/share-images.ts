import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { chromium } from '@playwright/test'
import { createServer } from 'vite'

import { SHARE_CARD_SIZE } from '../src/infrastructure/seo/share-card-size.ts'

/**
 * Prints the share card and the raster icons from their sources:
 * `share-card.html` into `og-image.png`, `favicon.svg` into the iOS home-screen
 * icon and the `favicon.ico` some crawlers ask for whatever the page links.
 */

const WEB_DIR = join(import.meta.dirname, '..')
const PUBLIC_DIR = join(WEB_DIR, 'public')

/** iOS rounds the corners itself, so the square is full-bleed, on the album's paper. */
const IOS_TOUCH_ICON_SIZE = 180
const IOS_TOUCH_ICON_BACKGROUND = '#f1f5f8'
const LEGACY_ICO_SIZE = 48

/** An ICO file holding one PNG image, which every browser reads since Vista. */
const icoWrapping = (png: Buffer, size: number): Buffer => {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size, 0)
  entry.writeUInt8(size, 1)
  entry.writeUInt16LE(1, 4)
  entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(header.length + entry.length, 12)
  return Buffer.concat([header, entry, png])
}

const server = await createServer({
  logLevel: 'error',
  root: WEB_DIR,
  server: { port: 0 }
})
await server.listen()
const origin = server.resolvedUrls?.local[0]?.replace(/\/$/, '')

if (origin === undefined) {
  throw new Error('The Vite server gave no local URL')
}

const browser = await chromium.launch()

try {
  const page = await browser.newPage({ viewport: SHARE_CARD_SIZE })

  await page.goto(`${origin}/share-card.html`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(PUBLIC_DIR, 'og-image.png') })

  const favicon = await readFile(join(PUBLIC_DIR, 'favicon.svg'), 'utf8')
  const renderFavicon = async (
    size: number,
    background: string
  ): Promise<Buffer> => {
    await page.setViewportSize({ height: size, width: size })
    await page.setContent(
      `<body style="margin:0;background:${background}">${favicon.replace(
        '<svg ',
        `<svg width="${size}" height="${size}" `
      )}</body>`
    )
    return page.screenshot({ omitBackground: background === 'transparent' })
  }

  await writeFile(
    join(PUBLIC_DIR, 'apple-touch-icon.png'),
    await renderFavicon(IOS_TOUCH_ICON_SIZE, IOS_TOUCH_ICON_BACKGROUND)
  )
  await writeFile(
    join(PUBLIC_DIR, 'favicon.ico'),
    icoWrapping(
      await renderFavicon(LEGACY_ICO_SIZE, 'transparent'),
      LEGACY_ICO_SIZE
    )
  )
} finally {
  await browser.close()
  await server.close()
}
