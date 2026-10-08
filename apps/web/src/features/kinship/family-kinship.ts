import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import type { KinPath, Kinship } from '@arbor/core/kinship/kinship'
import { kinshipBetween } from '@arbor/core/kinship/kinship-between'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

/** What `relativeId` is to `personId` in the family as it stands, the bin left out. */
export const familyKinship = (
  family: FamilyState,
  pair: { personId: EntityId; relativeId: EntityId }
): Kinship =>
  kinshipBetween(
    {
      lineage: familyLineage(family),
      sexOf: (personId) => family.persons.get(personId)?.sex ?? 'unknown'
    },
    pair
  )

/** The people a kinship goes through, `null` when there is no path to draw. */
export const kinPathOf = (kinship: Kinship): KinPath | null => {
  switch (kinship.kind) {
    case 'blood':
    case 'in-law':
      return kinship.tie.path
    case 'partner':
      return kinship.path
    case 'self':
    case 'unrelated':
      return null
    default:
      return kinship satisfies never
  }
}
