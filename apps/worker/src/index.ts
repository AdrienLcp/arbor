import type { Env } from './env'
import { handleRequest } from './infrastructure/http/handle-request'

export { FamilyRoom } from './infrastructure/durable-objects/family-room'

export default {
  fetch: handleRequest
} satisfies ExportedHandler<Env>
