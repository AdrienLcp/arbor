import { zValidator } from '@hono/zod-validator'

import { keyIdSchema } from '@arbor/protocol/access'
import { API_ROUTES, issueKeyInputSchema } from '@arbor/protocol/routes'

import {
  issueKey,
  listKeys,
  replaceFamilyKey,
  revokeKey
} from '@/domain/access/access-service'
import { mintKey } from '@/infrastructure/access-keys'
import { now } from '@/infrastructure/clock'
import { toIsoString } from '@/infrastructure/dates'

import { admitted } from './admission'
import { apiError, apiJson } from './api-response'
import { invalidInput } from './invalid-input'
import type { RoomApp } from './room-context'

/** The links of the family, managed by its keepers only. */
export const registerAccessRoutes = (app: RoomApp) => {
  app.get(API_ROUTES.keys, admitted('keeper'), (context) =>
    apiJson({ keys: listKeys(context.var.stores.access) })
  )

  app.post(
    API_ROUTES.keys,
    admitted('keeper'),
    zValidator('json', issueKeyInputSchema, invalidInput),
    async (context) => {
      const { stores } = context.var
      const { role } = context.req.valid('json')
      const minted = await mintKey()
      const at = toIsoString(now())
      const issued = stores.transaction(() =>
        issueKey({ at, minted, role, store: stores.access })
      )
      return apiJson(issued, 201)
    }
  )

  app.post(API_ROUTES.familyKey, admitted('keeper'), async (context) => {
    const { stores } = context.var
    const minted = await mintKey()
    const at = toIsoString(now())
    const issued = stores.transaction(() =>
      replaceFamilyKey({ at, minted, store: stores.access })
    )
    return apiJson(issued, 201)
  })

  app.delete(API_ROUTES.key, admitted('keeper'), (context) => {
    const keyId = keyIdSchema.safeParse(context.req.param('keyId'))
    if (!keyId.success) return apiError('not_found', 'No such key')

    const { stores } = context.var
    const at = toIsoString(now())
    const revoked = stores.transaction(() =>
      revokeKey({ at, keyId: keyId.data, store: stores.access })
    )
    return revoked.status === 'failure'
      ? apiError(revoked.error, 'The key stays as it was')
      : apiJson({ id: keyId.data })
  })
}
