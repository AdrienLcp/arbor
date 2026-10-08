import { describe, expect, it } from 'vitest'

import { handleRequest } from './handle-request'

const APP_DOCUMENT = '<!doctype html><div id="root"></div>'

const targets = {
  assets: { fetch: async () => new Response(APP_DOCUMENT) },
  rooms: {
    create: () => Promise.reject(new Error('No family is created here')),
    fetch: () => Promise.reject(new Error('No family is reached here')),
    fetchDemo: () => Promise.reject(new Error('No demo is reached here'))
  }
}

const request = (path: string, origin = 'https://arbor.adrienlcp.com') =>
  handleRequest(new Request(new URL(path, origin)), targets)

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

  it('serves a family page, whatever the family, with a 200 kept out of search results', async () => {
    const response = await request('/f/abcdefghijklmnopqrstuv/share/')

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
  })

  it('serves the web app with a 404 for an address that names no page', async () => {
    const response = await request('/nowhere')

    expect(response.status).toBe(404)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(await response.text()).toBe(APP_DOCUMENT)
  })
})
