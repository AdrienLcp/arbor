import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '../family/family-state'

/**
 * Everyone in the family tied to no one yet — no parent, no child, no union
 * — who waits beside the tree until someone knows where they belong. People
 * in the bin are left out.
 */
export const unplacedPeople = (family: FamilyState): EntityId[] => {
  const tied = new Set<EntityId>()
  for (const { childId, parentId } of family.filiations.values()) {
    tied.add(childId)
    tied.add(parentId)
  }
  for (const { partnerIds } of family.unions.values()) {
    for (const partnerId of partnerIds) {
      if (partnerId !== null) tied.add(partnerId)
    }
  }
  return [...family.persons.keys()].filter(
    (personId) => !tied.has(personId) && !family.binnedPersonIds.has(personId)
  )
}
