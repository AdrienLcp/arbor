import { zValidator } from '@hono/zod-validator'
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

import { admitted } from './admission'
import { apiError, apiJson } from './api-response'
import { invalidInput } from './invalid-input'
import { type RoomApp, viewerOf } from './room-context'

const logPageQuerySchema = z.object({
  [AFTER_REVISION_QUERY]: z.coerce.number().pipe(z.int().min(0)).default(0)
})

/** The family's tree and its change log. */
export const registerFamilyRoutes = (app: RoomApp) => {
  app.get(API_ROUTES.family, admitted('reader'), (context) => {
    const { family } = context.var.stores
    return apiJson(
      toFamilyResponse({
        family: family.readFamily(),
        revision: family.readRevision(),
        viewer: viewerOf(context.var)
      })
    )
  })

  app.post(
    API_ROUTES.operations,
    admitted('contributor'),
    zValidator('json', recordOperationsInputSchema, invalidInput),
    (context) => {
      const { stores } = context.var
      const input = context.req.valid('json')
      const at = toIsoString(now())
      const recorded = stores.transaction(() =>
        recordOperations({ at, input, store: stores.family })
      )
      return recorded.status === 'failure'
        ? apiError(recorded.error, 'The family refused the operations')
        : apiJson(recorded.data, 201)
    }
  )

  app.get(
    API_ROUTES.operations,
    admitted('contributor'),
    zValidator('query', logPageQuerySchema, invalidInput),
    (context) =>
      apiJson(
        readLogPage({
          after: context.req.valid('query')[AFTER_REVISION_QUERY],
          store: context.var.stores.family
        })
      )
  )

  app.post(
    API_ROUTES.undo,
    admitted('contributor'),
    zValidator('json', undoInputSchema, invalidInput),
    (context) => {
      const { admission, stores } = context.var
      const input = context.req.valid('json')
      const at = toIsoString(now())
      const undone = stores.transaction(() =>
        undoEntries({ at, input, role: admission.role, store: stores.family })
      )
      return undone.status === 'failure'
        ? apiError(undone.error, 'The family refused to take the entries back')
        : apiJson(undone.data, 201)
    }
  )

  app.post(
    API_ROUTES.restore,
    admitted('keeper'),
    zValidator('json', restoreInputSchema, invalidInput),
    (context) => {
      const { stores } = context.var
      const input = context.req.valid('json')
      const at = toIsoString(now())
      const restored = stores.transaction(() =>
        restoreFamily({ at, input, store: stores.family })
      )
      return restored.status === 'failure'
        ? apiError(restored.error, 'The family refused the restore')
        : apiJson(restored.data, 201)
    }
  )
}
