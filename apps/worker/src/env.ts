import type { FamilyRoom } from './infrastructure/durable-objects/family-room'

/** The bindings `wrangler.jsonc` declares. */
export type Env = {
  ASSETS: Fetcher
  FAMILY_ROOMS: DurableObjectNamespace<FamilyRoom>
}
