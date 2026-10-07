import { Result } from '@adrienlcp/result'
import { Hono } from 'hono'

import type { CreatedFamily, CreateFamilyInput } from '@arbor/protocol/routes'

import { createSqlAccessStore } from '@/domain/access/sql-access-store'
import { openFamily } from '@/domain/family/family-service'
import { createSqlFamilyStore } from '@/domain/family/sql-family-store'
import { createSqlPhotoStore } from '@/domain/photos/sql-photo-store'
import { mintKey } from '@/infrastructure/access-keys'
import { now } from '@/infrastructure/clock'
import { toIsoString } from '@/infrastructure/dates'
import {
  hasFamilySchema,
  migrateFamilySchema
} from '@/infrastructure/durable-objects/family-schema'
import type { SqlDatabase } from '@/infrastructure/durable-objects/sql-database'

import { registerAccessRoutes } from './access-routes'
import { answerUnexpected, apiError } from './api-response'
import { registerFamilyRoutes } from './family-routes'
import { registerPhotoRoutes } from './photo-routes'
import type { RoomApp, RoomStores } from './room-context'
import { registerSettingsRoutes } from './settings-routes'

/** The keys a new family starts with. */
export type FamilyKeys = Omit<CreatedFamily, 'familyId'>

/** What a family's object answers: its creation, then the API under its address. */
export type FamilyRoomApp = {
  create: (
    input: CreateFamilyInput
  ) => Promise<Result<FamilyKeys, 'family_exists'>>
  fetch: (request: Request) => Promise<Response>
}

/**
 * One family's object, as plain code over its database so tests run it on any
 * SQLite. An object that holds no family answers 404 without writing anything.
 */
export const familyRoomApp = (database: SqlDatabase): FamilyRoomApp => {
  let isOpen = hasFamilySchema(database)
  if (isOpen) migrateFamilySchema(database)

  const stores: RoomStores = {
    access: createSqlAccessStore(database),
    databaseSize: database.size,
    family: createSqlFamilyStore(database),
    photos: createSqlPhotoStore(database),
    transaction: database.transaction
  }

  const app: RoomApp = new Hono()

  app.use(async (context, next) => {
    if (!isOpen) return apiError('not_found', 'No family behind this address')
    context.set('stores', stores)
    await next()
  })

  registerFamilyRoutes(app)
  registerPhotoRoutes(app)
  registerAccessRoutes(app)
  registerSettingsRoutes(app)

  app.notFound(() => apiError('not_found', 'No route behind this address'))
  app.onError(answerUnexpected)

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
    fetch: async (request) => app.fetch(request)
  }
}
