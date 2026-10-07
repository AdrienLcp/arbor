import {
  API_ROUTES,
  updateFamilySettingsInputSchema
} from '@arbor/protocol/routes'

import { updateSettings } from '@/domain/family/family-service'
import { storageUsageOf } from '@/domain/family/storage-usage'

import { apiError, apiJson } from './api-response'
import { readJsonBody } from './request-body'
import { admittedSettingsOf, type RoomRoute } from './room-request'

/** What the keeper's settings screen reads and changes. */
export const SETTINGS_ROUTES: readonly RoomRoute[] = [
  {
    handle: async (roomRequest) => {
      const input = updateFamilySettingsInputSchema.safeParse(
        await readJsonBody(roomRequest.request)
      )
      if (!input.success) return apiError('invalid_input', input.error.message)

      const { stores } = roomRequest
      const updated = stores.transaction(() =>
        updateSettings({
          changes: input.data,
          current: admittedSettingsOf(roomRequest),
          store: stores.family
        })
      )
      return apiJson(updated)
    },
    method: 'PATCH',
    needs: 'keeper',
    pattern: API_ROUTES.settings
  },
  {
    handle: ({ stores }) => apiJson(storageUsageOf(stores.databaseSize())),
    method: 'GET',
    needs: 'keeper',
    pattern: API_ROUTES.usage
  }
]
