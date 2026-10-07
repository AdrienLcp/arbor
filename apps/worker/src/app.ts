import { zValidator } from '@hono/zod-validator'
import { type Context, Hono } from 'hono'

import { familyIdSchema } from '@arbor/protocol/access'
import {
  API_PREFIX,
  API_ROUTES,
  type CreatedFamily,
  createFamilyInputSchema,
  type HealthResponse
} from '@arbor/protocol/routes'

import {
  type FamilyRooms,
  familyRoomsOf
} from '@/infrastructure/durable-objects/family-rooms'
import {
  answerUnexpected,
  apiError,
  apiJson
} from '@/infrastructure/http/api-response'
import { invalidInput } from '@/infrastructure/http/invalid-input'
import { serveWebApp } from '@/infrastructure/http/serve-web-app'
import { newFamilyId } from '@/infrastructure/ids'

type WorkerEnv = { Bindings: Env; Variables: { rooms: FamilyRooms } }

export type WorkerApp = Hono<WorkerEnv>

/** Sends a request to its family's object; an address that cannot be a family id never wakes one. */
const forwardToFamily = (context: Context<WorkerEnv>) => {
  const familyId = familyIdSchema.safeParse(context.req.param('familyId'))
  if (!familyId.success) {
    return apiError('not_found', 'No family behind this address')
  }
  return context.var.rooms.fetch(familyId.data, context.req.raw)
}

/** The worker's front door: the API; every other address is the web app. */
export const createApp = (): WorkerApp => {
  const app: WorkerApp = new Hono()

  app.use(async (context, next) => {
    context.set('rooms', familyRoomsOf(context.env.FAMILY_ROOMS))
    await next()
  })

  app.get(API_ROUTES.health, () =>
    Response.json({ status: 'ok' } satisfies HealthResponse)
  )

  app.post(
    API_ROUTES.families,
    zValidator('json', createFamilyInputSchema, invalidInput),
    async (context) => {
      const familyId = newFamilyId()
      const created = await context.var.rooms.create(
        familyId,
        context.req.valid('json')
      )
      if (created.status === 'failure') {
        return apiError('internal_error', 'Drew the id of an existing family')
      }
      return apiJson({ familyId, ...created.data } satisfies CreatedFamily, 201)
    }
  )

  app.all(API_ROUTES.family, forwardToFamily)
  app.all(`${API_ROUTES.family}/*`, forwardToFamily)
  app.all(`${API_PREFIX}/*`, () =>
    apiError('not_found', 'No route behind this address')
  )
  app.all('*', (context) => serveWebApp(context.req.raw, context.env.ASSETS))

  app.onError(answerUnexpected)

  return app
}
