import type { Result } from '@adrienlcp/result'

import type { FamilyId } from '@arbor/protocol/access'
import { DEMO_FAMILY_ID } from '@arbor/protocol/demo-family'
import type { CreateFamilyInput } from '@arbor/protocol/routes'

import type { FamilyKeys } from '@/infrastructure/http/family-room-app'

import type { FamilyRoom } from './family-room'

/** Reaches the object of one family by its id; each family's data lives in its own. */
export type FamilyRooms = {
  create: (
    familyId: FamilyId,
    input: CreateFamilyInput
  ) => Promise<Result<FamilyKeys, 'family_exists'>>
  fetch: (familyId: FamilyId, request: Request) => Promise<Response>
  /** Sends a request to the public demo, built first if it is not there yet. */
  fetchDemo: (request: Request) => Promise<Response>
}

export const familyRoomsOf = (
  namespace: DurableObjectNamespace<FamilyRoom>
): FamilyRooms => {
  const roomOf = (familyId: FamilyId) =>
    namespace.get(namespace.idFromName(familyId))
  return {
    create: (familyId, input) => roomOf(familyId).create(input),
    fetch: (familyId, request) => roomOf(familyId).fetch(request),
    fetchDemo: (request) => roomOf(DEMO_FAMILY_ID).fetchDemo(request)
  }
}
