import { z } from 'zod'

import {
  AFTER_REVISION_QUERY,
  API_ROUTES,
  recordOperationsInputSchema,
  restoreInputSchema,
  undoInputSchema
} from '@arbor/protocol/routes'

import {
  readLogPage,
  recordOperations,
  restoreFamily,
  undoEntries
} from '@/domain/family/family-service'
import { toFamilyResponse } from '@/domain/family/family-view'
import { now } from '@/infrastructure/clock'
import { toIsoString } from '@/infrastructure/dates'

import { apiError, apiJson } from './api-response'
import { readJsonBody } from './request-body'
import { type RoomRoute, viewerOf } from './room-request'

const afterRevisionSchema = z.coerce.number().pipe(z.int().min(0)).default(0)

/** The family's tree and its change log. */
export const FAMILY_ROUTES: readonly RoomRoute[] = [
  {
    handle: (roomRequest) => {
      const { family } = roomRequest.stores
      return apiJson(
        toFamilyResponse({
          family: family.readFamily(),
          revision: family.readRevision(),
          viewer: viewerOf(roomRequest)
        })
      )
    },
    method: 'GET',
    needs: 'reader',
    pattern: API_ROUTES.family
  },
  {
    handle: async ({ request, stores }) => {
      const input = recordOperationsInputSchema.safeParse(
        await readJsonBody(request)
      )
      if (!input.success) return apiError('invalid_input', input.error.message)

      const at = toIsoString(now())
      const recorded = stores.transaction(() =>
        recordOperations({ at, input: input.data, store: stores.family })
      )
      return recorded.status === 'failure'
        ? apiError(recorded.error, 'The family refused the operations')
        : apiJson(recorded.data, 201)
    },
    method: 'POST',
    needs: 'contributor',
    pattern: API_ROUTES.operations
  },
  {
    handle: ({ request, stores }) => {
      const after = afterRevisionSchema.safeParse(
        new URL(request.url).searchParams.get(AFTER_REVISION_QUERY) ?? undefined
      )
      if (!after.success) return apiError('invalid_input', after.error.message)
      return apiJson(readLogPage({ after: after.data, store: stores.family }))
    },
    method: 'GET',
    needs: 'contributor',
    pattern: API_ROUTES.operations
  },
  {
    handle: async ({ admission, request, stores }) => {
      const input = undoInputSchema.safeParse(await readJsonBody(request))
      if (!input.success) return apiError('invalid_input', input.error.message)

      const at = toIsoString(now())
      const undone = stores.transaction(() =>
        undoEntries({
          at,
          input: input.data,
          role: admission.role,
          store: stores.family
        })
      )
      return undone.status === 'failure'
        ? apiError(undone.error, 'The family refused to take the entries back')
        : apiJson(undone.data, 201)
    },
    method: 'POST',
    needs: 'contributor',
    pattern: API_ROUTES.undo
  },
  {
    handle: async ({ request, stores }) => {
      const input = restoreInputSchema.safeParse(await readJsonBody(request))
      if (!input.success) return apiError('invalid_input', input.error.message)

      const at = toIsoString(now())
      const restored = stores.transaction(() =>
        restoreFamily({ at, input: input.data, store: stores.family })
      )
      return restored.status === 'failure'
        ? apiError(restored.error, 'The family refused the restore')
        : apiJson(restored.data, 201)
    },
    method: 'POST',
    needs: 'keeper',
    pattern: API_ROUTES.restore
  }
]
