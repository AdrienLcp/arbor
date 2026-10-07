import { describe, expect, it } from 'vitest'

import { serveWebApp } from './serve-web-app'

const APP_DOCUMENT = '<!doctype html><div id="root"></div>'

const assets = { fetch: async () => new Response(APP_DOCUMENT) }

const serve = (path: string, origin = 'https://arbor.adrienlcp.com') =>
  serveWebApp(new Request(new URL(path, origin)), assets)

describe('serveWebApp', () => {
  it('lets search engines index the landing page on the published host only', async () => {
    const published = await serve('/')
    const mirror = await serve('/', 'http://localhost:8790')

    expect(published.headers.get('X-Robots-Tag')).toBeNull()
    expect(mirror.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('serves a family page, whatever the family, with a 200 kept out of search results', async () => {
    const response = await serve('/f/abcdefghijklmnopqrstuv/share/')

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('serves the web app with a 404 for an address that names no page', async () => {
    const response = await serve('/nowhere')

    expect(response.status).toBe(404)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(await response.text()).toBe(APP_DOCUMENT)
  })
})
