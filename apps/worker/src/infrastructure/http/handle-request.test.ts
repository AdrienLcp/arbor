import { describe, expect, it } from 'vitest'

import { handleRequest } from './handle-request'

const APP_DOCUMENT = '<!doctype html><div id="root"></div>'

const env = {
  ASSETS: { fetch: async () => new Response(APP_DOCUMENT) }
}

const request = (path: string, origin = 'https://arbor.adrienlcp.com') =>
  handleRequest(new Request(new URL(path, origin)), env)

describe('handleRequest', () => {
  it('answers the health check', async () => {
    const response = await request('/api/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('refuses an unknown API route with a coded error', async () => {
    const response = await request('/api/nothing')

    expect(response.status).toBe(404)
    expect(await response.json()).toMatchObject({ code: 'not_found' })
  })

  it('lets search engines index the landing page on the published host only', async () => {
    const published = await request('/')
    const mirror = await request('/', 'http://localhost:8790')

    expect(published.headers.get('X-Robots-Tag')).toBeNull()
    expect(mirror.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('serves the web app with a 404 for an address that names no page', async () => {
    const response = await request('/nowhere')

    expect(response.status).toBe(404)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(await response.text()).toBe(APP_DOCUMENT)
  })
})
