import type { EntityId } from '@arbor/protocol/entity-id'
import type { FamilySnapshot } from '@arbor/protocol/family'

import type { FamilyState } from './family-state'

const byId = <Entity extends { id: EntityId }>(
  entities: readonly Entity[]
): ReadonlyMap<EntityId, Entity> =>
  new Map(entities.map((entity) => [entity.id, entity]))

/** The family a snapshot from the server describes, in the shape the rules read. */
export const familyStateOfSnapshot = (
  snapshot: FamilySnapshot
): FamilyState => ({
  binnedPersonIds: new Set(snapshot.binnedPersonIds),
  events: byId(snapshot.events),
  filiations: byId(snapshot.filiations),
  persons: byId(snapshot.persons),
  photos: byId(snapshot.photos),
  unions: byId(snapshot.unions)
})
