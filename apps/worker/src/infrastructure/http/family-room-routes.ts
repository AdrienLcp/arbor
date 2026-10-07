import { Result } from '@adrienlcp/result'

import { accessKeySchema } from '@arbor/protocol/access'
import {
  AUTHORIZATION_SCHEME,
  type CreatedFamily,
  type CreateFamilyInput
} from '@arbor/protocol/routes'

import { admit } from '@/domain/access/access-service'
import { canActAs } from '@/domain/access/role-rank'
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
import { createSqlFamilyStore } from '@/infrastructure/durable-objects/sql-family-store'
import { createSqlPhotoStore } from '@/infrastructure/durable-objects/sql-photo-store'

import { ACCESS_ROUTES } from './access-routes'
import { apiError } from './api-response'
import { FAMILY_ROUTES } from './family-routes'
import { PHOTO_ROUTES } from './photo-routes'
import type { RoomStores } from './room-request'

const ROOM_ROUTES = [...FAMILY_ROUTES, ...PHOTO_ROUTES, ...ACCESS_ROUTES].map(
  (route) => ({
    ...route,
    urlPattern: new URLPattern({ pathname: route.pattern })
  })
)

/** The keys a new family starts with. */
export type FamilyKeys = Omit<CreatedFamily, 'familyId'>

/** What a family's object answers: its creation, then the API under its address. */
export type FamilyRoomRoutes = {
  create: (
    input: CreateFamilyInput
  ) => Promise<Result<FamilyKeys, 'family_exists'>>
  fetch: (request: Request) => Promise<Response>
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
    family: createSqlFamilyStore(database),
    photos: createSqlPhotoStore(database),
    transaction: database.transaction
  }

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
    fetch: (request) =>
      isOpen
        ? answer(request, stores)
        : Promise.resolve(
            apiError('not_found', 'No family behind this address')
          )
  }
}
