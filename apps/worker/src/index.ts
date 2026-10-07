import 'temporal-polyfill/global'

import type { Env } from './env'
import { familyRoomsOf } from './infrastructure/durable-objects/family-rooms'
import { handleRequest } from './infrastructure/http/handle-request'

export { FamilyRoom } from './infrastructure/durable-objects/family-room'

export default {
  fetch: (request, env) =>
    handleRequest(request, {
      assets: env.ASSETS,
      rooms: familyRoomsOf(env.FAMILY_ROOMS)
    })
} satisfies ExportedHandler<Env>
