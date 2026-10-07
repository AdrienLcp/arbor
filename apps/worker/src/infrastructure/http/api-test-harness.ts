import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { createTestHarness } from 'wrangler'

import type { AccessKey, FamilyId } from '@arbor/protocol/access'
import {
  API_ROUTES,
  AUTHORIZATION_SCHEME,
  type CreatedFamily,
  createdFamilySchema,
  pathFor
} from '@arbor/protocol/routes'

const WORKER_DIRECTORY = resolve(import.meta.dirname, '../../..')
/** `wrangler.jsonc` serves the built web app from here, and refuses to start without the folder. */
const WEB_APP_DIRECTORY = resolve(WORKER_DIRECTORY, '../web/dist')

type Call = {
  body?: BodyInit | object
  key?: AccessKey
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
}

const isJsonBody = (body: Call['body']): body is object =>
  body !== undefined &&
  !(body instanceof FormData) &&
  !(body instanceof Uint8Array) &&
  typeof body === 'object'

/**
 * The Worker as `wrangler.jsonc` builds it: the front door and every family's
 * Durable Object on the SQLite workerd gives it, one object per family.
 */
export const createTestApi = () => {
  mkdirSync(WEB_APP_DIRECTORY, { recursive: true })
  const server = createTestHarness({
    workers: [{ configPath: resolve(WORKER_DIRECTORY, 'wrangler.jsonc') }]
  })

  const call = async (
    path: string,
    { body, key, method = 'GET' }: Call = {}
  ) => {
    const encoded = new Request('http://localhost', {
      body: isJsonBody(body) ? JSON.stringify(body) : body,
      headers: isJsonBody(body) ? { 'Content-Type': 'application/json' } : {},
      method
    })
    const headers = Object.fromEntries(encoded.headers)
    if (key !== undefined) {
      headers.Authorization = `${AUTHORIZATION_SCHEME} ${key}`
    }
    return server.fetch(path, {
      body: body === undefined ? undefined : await encoded.arrayBuffer(),
      headers,
      method
    })
  }

  const createFamily = async (
    name = 'Famille Morel'
  ): Promise<CreatedFamily> => {
    const response = await call(API_ROUTES.families, {
      body: { name },
      method: 'POST'
    })
    return createdFamilySchema.parse(await response.json())
  }

  return {
    call,
    createFamily,
    start: async () => {
      await server.listen()
    },
    stop: () => server.close()
  }
}

/** The address of one of a family's routes. */
export const familyPath = (
  familyId: FamilyId,
  route:
    | 'family'
    | 'familyKey'
    | 'keys'
    | 'operations'
    | 'settings'
    | 'usage' = 'family'
) => pathFor(API_ROUTES[route], { familyId })
