import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from './family-state'

/** The family as drawn without some people: they, their unions and their filiations leave; nothing is changed in the family itself. */
export const withoutPeople = (
  family: FamilyState,
  personIds: ReadonlySet<EntityId>
): FamilyState => {
  if (personIds.size === 0) return family

  const isKept = (personId: EntityId | null) =>
    personId === null || !personIds.has(personId)

  return {
    ...family,
    filiations: new Map(
      [...family.filiations].filter(
        ([, { childId, parentId }]) => isKept(childId) && isKept(parentId)
      )
    ),
    persons: new Map(
      [...family.persons].filter(([personId]) => isKept(personId))
    ),
    unions: new Map(
      [...family.unions].filter(([, { partnerIds }]) =>
        partnerIds.every(isKept)
      )
    )
  }
}

/** The children who lose a parent when `personIds` leave the drawing: the slot beside them stands for someone hidden, not someone unknown. */
export const childrenLosingAParent = (
  family: FamilyState,
  personIds: ReadonlySet<EntityId>
): ReadonlySet<EntityId> =>
  new Set(
    [...family.filiations.values()]
      .filter(
        ({ childId, parentId }) =>
          personIds.has(parentId) && !personIds.has(childId)
      )
      .map(({ childId }) => childId)
  )
