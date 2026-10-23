import { familyIdSchema } from '@arbor/protocol/access'
import { entityIdSchema } from '@arbor/protocol/entity-id'
import { API_ROUTES } from '@arbor/protocol/routes'

import type { WorkerApp } from '@/app'

import { carriesAdminKey } from './admin-key'
import { apiError, apiJson } from './api-response'

/**
 * The publisher's erasure of one person, for a relative who asked and whom no
 * keeper answered: `DELETE` with the `ADMIN_KEY` secret as the bearer token.
 * Registered before the family's own routes, which would take the address.
 */
export const registerErasureRoutes = (app: WorkerApp) => {
  app.delete(API_ROUTES.person, async (context) => {
    const isAdmin = await carriesAdminKey({
      adminKey: context.env.ADMIN_KEY,
      authorization: context.req.header('Authorization')
    })
    if (!isAdmin) return apiError('unauthorized', 'The admin key is required')

    const familyId = familyIdSchema.safeParse(context.req.param('familyId'))
    const personId = entityIdSchema.safeParse(context.req.param('personId'))
    if (!familyId.success || !personId.success) {
      return apiError('not_found', 'No person behind this address')
    }

    const erased = await context.var.rooms.erasePerson(
      familyId.data,
      personId.data
    )
    if (erased.status === 'success') return apiJson(erased.data)
    return erased.error === 'erasure_breaks_replay'
      ? apiError(
          'internal_error',
          'The log without this person does not replay'
        )
      : apiError('not_found', 'No person behind this address')
  })
}
