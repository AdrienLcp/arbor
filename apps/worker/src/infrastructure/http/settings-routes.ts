import { zValidator } from '@hono/zod-validator'

import {
  API_ROUTES,
  updateFamilySettingsInputSchema
} from '@arbor/protocol/routes'

import { updateSettings } from '@/domain/family/family-service'
import { storageUsageOf } from '@/domain/family/storage-usage'

import { admitted } from './admission'
import { apiJson } from './api-response'
import { invalidInput } from './invalid-input'
import { admittedSettingsOf, type RoomApp } from './room-context'

/** What the keeper's settings screen reads and changes. */
export const registerSettingsRoutes = (app: RoomApp) => {
  app.patch(
    API_ROUTES.settings,
    admitted('keeper'),
    zValidator('json', updateFamilySettingsInputSchema, invalidInput),
    (context) => {
      const { stores } = context.var
      const changes = context.req.valid('json')
      const updated = stores.transaction(() =>
        updateSettings({
          changes,
          current: admittedSettingsOf(stores),
          store: stores.family
        })
      )
      return apiJson(updated)
    }
  )

  app.get(API_ROUTES.usage, admitted('keeper'), (context) =>
    apiJson(storageUsageOf(context.var.stores.databaseSize()))
  )
}
