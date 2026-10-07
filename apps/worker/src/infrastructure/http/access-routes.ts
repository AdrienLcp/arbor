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

import { apiError, apiJson } from './api-response'
import { readJsonBody } from './request-body'
import type { RoomRoute } from './room-request'

/** The links of the family, managed by its keepers only. */
export const ACCESS_ROUTES: readonly RoomRoute[] = [
  {
    handle: ({ stores }) => apiJson({ keys: listKeys(stores.access) }),
    method: 'GET',
    needs: 'keeper',
    pattern: API_ROUTES.keys
  },
  {
    handle: async ({ request, stores }) => {
      const input = issueKeyInputSchema.safeParse(await readJsonBody(request))
      if (!input.success) return apiError('invalid_input', input.error.message)

      const minted = await mintKey()
      const at = toIsoString(now())
      const issued = stores.transaction(() =>
        issueKey({ at, minted, role: input.data.role, store: stores.access })
      )
      return apiJson(issued, 201)
    },
    method: 'POST',
    needs: 'keeper',
    pattern: API_ROUTES.keys
  },
  {
    handle: async ({ stores }) => {
      const minted = await mintKey()
      const at = toIsoString(now())
      const issued = stores.transaction(() =>
        replaceFamilyKey({ at, minted, store: stores.access })
      )
      return apiJson(issued, 201)
    },
    method: 'POST',
    needs: 'keeper',
    pattern: API_ROUTES.familyKey
  },
  {
    handle: ({ parameters, stores }) => {
      const keyId = keyIdSchema.safeParse(parameters.keyId)
      if (!keyId.success) return apiError('not_found', 'No such key')

      const at = toIsoString(now())
      const revoked = stores.transaction(() =>
        revokeKey({ at, keyId: keyId.data, store: stores.access })
      )
      return revoked.status === 'failure'
        ? apiError(revoked.error, 'The key stays as it was')
        : apiJson({ id: keyId.data })
    },
    method: 'DELETE',
    needs: 'keeper',
    pattern: API_ROUTES.key
  }
]
