import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { PAGE_ROUTES } from '@arbor/protocol/page-routes'
import { SITE_ORIGIN } from '@arbor/protocol/site'

import { SHARE_CARD_SIZE } from './share-card-size'

const WEB_DIRECTORY = resolve(import.meta.dirname, '../../..')
const PUBLIC_DIRECTORY = resolve(WEB_DIRECTORY, 'public')
const INDEX_HTML = readFileSync(resolve(WEB_DIRECTORY, 'index.html'), 'utf8')
const SITEMAP = readFileSync(resolve(PUBLIC_DIRECTORY, 'sitemap.xml'), 'utf8')
const ROBOTS = readFileSync(resolve(PUBLIC_DIRECTORY, 'robots.txt'), 'utf8')

/** The worker lets search engines index the landing page alone. */
const INDEXABLE_PAGES = [PAGE_ROUTES.home]

const ogProperty = (property: string): string | undefined =>
  new RegExp(`<meta content="([^"]*)" property="og:${property}"`).exec(
    INDEX_HTML
  )?.[1]

/** A PNG's IHDR chunk holds its width then its height, big-endian, from byte 16. */
const pngSize = (bytes: Buffer): string =>
  `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`

describe('share card', () => {
  test('names the published site', () => {
    expect(ogProperty('url')).toBe(`${SITE_ORIGIN}/`)
    expect(ogProperty('image')).toMatch(new RegExp(`^${SITE_ORIGIN}/`))
  })

  test('announces the size it is printed at', () => {
    expect(ogProperty('image:width')).toBe(String(SHARE_CARD_SIZE.width))
    expect(ogProperty('image:height')).toBe(String(SHARE_CARD_SIZE.height))
  })

  test('ships its image at the size it announces', () => {
    const image = ogProperty('image')?.replace(SITE_ORIGIN, '') ?? ''
    const bytes = readFileSync(resolve(PUBLIC_DIRECTORY, `.${image}`))

    expect(pngSize(bytes)).toBe(
      `${SHARE_CARD_SIZE.width}x${SHARE_CARD_SIZE.height}`
    )
  })
})

describe('crawl files', () => {
  test('robots.txt names the sitemap on the published site', () => {
    expect(ROBOTS).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)
  })

  test('the sitemap lists the indexable pages and nothing else', () => {
    const listed = [...SITEMAP.matchAll(/<loc>([^<]*)<\/loc>/g)].map(
      ([, location]) => location
    )

    expect(listed).toEqual(
      INDEXABLE_PAGES.map((page) => `${SITE_ORIGIN}${page}`)
    )
  })
})
