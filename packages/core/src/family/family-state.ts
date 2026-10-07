import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { LifeEvent } from '@arbor/protocol/life-event'
import type { Person } from '@arbor/protocol/person'
import type { Photo } from '@arbor/protocol/photo'
import type { Union } from '@arbor/protocol/union'

/** A family as the replay of its change log leaves it. */
export type FamilyState = {
  /** People in the bin: kept with every link, hidden until someone restores them. */
  binnedPersonIds: ReadonlySet<EntityId>
  events: ReadonlyMap<EntityId, LifeEvent>
  filiations: ReadonlyMap<EntityId, Filiation>
  persons: ReadonlyMap<EntityId, Person>
  photos: ReadonlyMap<EntityId, Photo>
  unions: ReadonlyMap<EntityId, Union>
}

export const EMPTY_FAMILY: FamilyState = {
  binnedPersonIds: new Set(),
  events: new Map(),
  filiations: new Map(),
  persons: new Map(),
  photos: new Map(),
  unions: new Map()
}
