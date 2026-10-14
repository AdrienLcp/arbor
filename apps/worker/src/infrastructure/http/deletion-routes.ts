import { zValidator } from '@hono/zod-validator'

import { familyIdSchema } from '@arbor/protocol/access'
import {
  API_ROUTES,
  type DeletedFamily,
  deleteFamilyInputSchema
} from '@arbor/protocol/routes'

import { isFamilyNameConfirmed } from '@arbor/core/family/family-name-confirmation'

import { admitted } from './admission'
import { apiError, apiJson } from './api-response'
import { invalidInput } from './invalid-input'
import { admittedSettingsOf, type RoomApp } from './room-context'

/**
 * A keeper's deletion of the whole family: once the typed name matches,
 * `eraseFamily` wipes everything the object stores, and every key stops at once.
 */
export const registerDeletionRoutes = (
  app: RoomApp,
  eraseFamily: () => Promise<void>
) => {
  app.delete(
    API_ROUTES.family,
    admitted('keeper'),
    zValidator('json', deleteFamilyInputSchema, invalidInput),
    async (context) => {
      const { confirmedName } = context.req.valid('json')
      const { name } = admittedSettingsOf(context.var.stores)
      if (!isFamilyNameConfirmed({ name, typed: confirmedName })) {
        return apiError('name_mismatch', 'The typed name is not the family’s')
      }

      await eraseFamily()
      const familyId = familyIdSchema.parse(context.req.param('familyId'))
      return apiJson({ familyId } satisfies DeletedFamily)
    }
  )
}
