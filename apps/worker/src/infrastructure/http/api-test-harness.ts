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
/** `name` in `wrangler.jsonc`. */
const WORKER_NAME = 'arbor'

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
  /**
   * Straight to the Worker's runtime. `server.fetch` goes through wrangler's
   * dev proxy, which on a loaded machine drops its connection to the Worker
   * and answers with the error text or a body it has already read.
   */
  const worker = server.getWorker(WORKER_NAME)

  /**
   * Answers with the body already buffered. Miniflare rewraps undici's
   * response and drops the original, whose stream undici cancels once it is
   * garbage collected: a body a test reads after its next call could be gone.
   */
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
    const response = await worker.fetch(path, {
      body: body === undefined ? undefined : await encoded.arrayBuffer(),
      headers,
      method
    })
    return new Response(await response.arrayBuffer(), {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
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
    /**
     * Resolves once the Worker and a family's Durable Object answer, so no
     * test pays for their boot: the first object of the class loads SQLite
     * and its schema, over a second on its own and several on a loaded
     * machine, against a five-second test timeout.
     */
    start: async () => {
      await server.listen()
      await call(API_ROUTES.health)
      await createFamily('Famille de mise en route')
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
