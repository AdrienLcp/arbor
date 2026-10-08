import { Result } from '@adrienlcp/result'

import { accessKeySchema } from '@arbor/protocol/access'
import { DEMO_FAMILY_KEY } from '@arbor/protocol/demo-family'
import {
  AUTHORIZATION_SCHEME,
  type CreatedFamily,
  type CreateFamilyInput
} from '@arbor/protocol/routes'

import { admit } from '@/domain/access/access-service'
import { canActAs } from '@/domain/access/role-rank'
import {
  DEMO_WRITES_PER_NIGHT,
  isWriteRequest
} from '@/domain/demo/demo-write-limit'
import {
  type DemoPhotoFiles,
  openDemoFamily
} from '@/domain/demo/open-demo-family'
import { openFamily } from '@/domain/family/family-service'
import { digestOf, mintKey } from '@/infrastructure/access-keys'
import { now } from '@/infrastructure/clock'
import { toIsoString } from '@/infrastructure/dates'
import {
  hasFamilySchema,
  migrateFamilySchema
} from '@/infrastructure/durable-objects/family-schema'
import { createSqlAccessStore } from '@/infrastructure/durable-objects/sql-access-store'
import type { SqlDatabase } from '@/infrastructure/durable-objects/sql-database'
import { createSqlDemoWriteCount } from '@/infrastructure/durable-objects/sql-demo-write-count'
import { createSqlFamilyStore } from '@/infrastructure/durable-objects/sql-family-store'
import { createSqlPhotoStore } from '@/infrastructure/durable-objects/sql-photo-store'
import { newKeyId } from '@/infrastructure/ids'

import { ACCESS_ROUTES } from './access-routes'
import { apiError } from './api-response'
import { FAMILY_ROUTES } from './family-routes'
import { PHOTO_ROUTES } from './photo-routes'
import type { RoomStores } from './room-request'
import { SETTINGS_ROUTES } from './settings-routes'

const ROOM_ROUTES = [
  ...FAMILY_ROUTES,
  ...PHOTO_ROUTES,
  ...ACCESS_ROUTES,
  ...SETTINGS_ROUTES
].map((route) => ({
  ...route,
  urlPattern: new URLPattern({ pathname: route.pattern })
}))

/** The keys a new family starts with. */
export type FamilyKeys = Omit<CreatedFamily, 'familyId'>

/** What a family's object answers: its creation, then the API under its address. */
export type FamilyRoomRoutes = {
  create: (
    input: CreateFamilyInput
  ) => Promise<Result<FamilyKeys, 'family_exists'>>
  fetch: (request: Request) => Promise<Response>
  /** The demo's API: as `fetch`, until its edits for the night run out. */
  fetchDemo: (request: Request) => Promise<Response>
  /** Builds the demo family if the object holds none yet; its family link opens with the public demo key. */
  openDemo: (photoFiles: DemoPhotoFiles) => Promise<void>
}

const presentedKey = (request: Request) => {
  const [scheme, key] = (request.headers.get('Authorization') ?? '').split(' ')
  return scheme === AUTHORIZATION_SCHEME ? accessKeySchema.safeParse(key) : null
}

const matchRoute = (request: Request) => {
  for (const route of ROOM_ROUTES) {
    const match = route.urlPattern.exec(request.url)
    if (match !== null && route.method === request.method) {
      return { parameters: match.pathname.groups, route }
    }
  }
  return null
}

/** Checks the key, then the role, then hands the request to its route. */
const answer = async (
  request: Request,
  stores: RoomStores
): Promise<Response> => {
  const matched = matchRoute(request)
  if (matched === null)
    return apiError('not_found', 'No route behind this address')

  const key = presentedKey(request)
  if (key === null || !key.success) {
    return apiError('unauthorized', 'A family key is required')
  }
  const digest = await digestOf(key.data)
  const admission = stores.transaction(() =>
    admit({ digest, now: now(), store: stores.access })
  )
  if (admission.status === 'failure') {
    return apiError(admission.error, 'The key was refused')
  }

  const { parameters, route } = matched
  if (!canActAs({ needed: route.needs, role: admission.data.role })) {
    return apiError('forbidden', 'This key cannot do that')
  }
  return route.handle({
    admission: admission.data,
    parameters,
    request,
    stores
  })
}

/**
 * One family's object, as plain code over its database so tests run it on any
 * SQLite. An object that holds no family answers 404 without writing anything.
 */
export const familyRoomRoutes = (database: SqlDatabase): FamilyRoomRoutes => {
  let isOpen = hasFamilySchema(database)
  if (isOpen) migrateFamilySchema(database)

  const stores: RoomStores = {
    access: createSqlAccessStore(database),
    databaseSize: database.size,
    family: createSqlFamilyStore(database),
    photos: createSqlPhotoStore(database),
    transaction: database.transaction
  }
  const demoWrites = createSqlDemoWriteCount(database)

  const fetch = (request: Request): Promise<Response> =>
    isOpen
      ? answer(request, stores)
      : Promise.resolve(apiError('not_found', 'No family behind this address'))

  return {
    create: async (input) => {
      const keeperKey = await mintKey()
      const familyKey = await mintKey()
      migrateFamilySchema(database)
      isOpen = true
      const opened = stores.transaction(() =>
        openFamily({
          access: stores.access,
          at: toIsoString(now()),
          familyKey,
          input,
          keeperKey,
          store: stores.family
        })
      )
      return opened.status === 'failure'
        ? opened
        : Result.success({ familyKey: familyKey.key, keeperKey: keeperKey.key })
    },
    fetch,
    fetchDemo: (request) => {
      if (isOpen && isWriteRequest(request)) {
        if (demoWrites.read() >= DEMO_WRITES_PER_NIGHT) {
          return Promise.resolve(
            apiError(
              'demo_write_limit',
              'The demo takes no more edits until its reset'
            )
          )
        }
        demoWrites.add()
      }
      return fetch(request)
    },
    openDemo: async (photoFiles) => {
      if (isOpen) return
      const keeperKey = await mintKey()
      const familyKey = {
        digest: await digestOf(DEMO_FAMILY_KEY),
        id: newKeyId(),
        key: DEMO_FAMILY_KEY
      }
      // A second request may have built it while the keys were hashed.
      if (isOpen) return
      migrateFamilySchema(database)
      stores.transaction(() =>
        openDemoFamily({
          access: stores.access,
          at: toIsoString(now()),
          familyKey,
          keeperKey,
          photoFiles,
          photos: stores.photos,
          store: stores.family
        })
      )
      isOpen = true
    }
  }
}
