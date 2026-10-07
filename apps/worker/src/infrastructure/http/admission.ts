import { createMiddleware } from 'hono/factory'

import { accessKeySchema, type Role } from '@arbor/protocol/access'
import { AUTHORIZATION_SCHEME } from '@arbor/protocol/routes'

import { admit } from '@/domain/access/access-service'
import { canActAs } from '@/domain/access/role-rank'
import { digestOf } from '@/infrastructure/access-keys'
import { now } from '@/infrastructure/clock'

import { apiError } from './api-response'
import type { RoomVariables } from './room-context'

const presentedKey = (authorization: string | undefined) => {
  const [scheme, key] = (authorization ?? '').split(' ')
  return scheme === AUTHORIZATION_SCHEME ? accessKeySchema.safeParse(key) : null
}

/** Lets a route run for a live key of the family whose role reaches `needed`: the key first, then the role. */
export const admitted = (needed: Role) =>
  createMiddleware<{ Variables: RoomVariables }>(async (context, next) => {
    const key = presentedKey(context.req.header('Authorization'))
    if (key === null || !key.success) {
      return apiError('unauthorized', 'A family key is required')
    }

    const digest = await digestOf(key.data)
    const { stores } = context.var
    const admission = stores.transaction(() =>
      admit({ digest, now: now(), store: stores.access })
    )
    if (admission.status === 'failure') {
      return apiError(admission.error, 'The key was refused')
    }
    if (!canActAs({ needed, role: admission.data.role })) {
      return apiError('forbidden', 'This key cannot do that')
    }

    context.set('admission', admission.data)
    await next()
  })
