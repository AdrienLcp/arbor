import type { EntityId } from '@arbor/protocol/entity-id'
import type { Union } from '@arbor/protocol/union'

import type { FamilyLineage } from '../tree-layout/family-lineage'
import { couplesOf } from './couples'

/** A person in the outline, with their couples and, under each, the children's own branches. */
export type OutlineBranch = {
  couples: readonly OutlineCouple[]
  /** Already written out higher up — a child of two relatives, say: named here, not repeated. */
  isRepeated: boolean
  personId: EntityId
}

export type OutlineCouple = {
  children: readonly OutlineBranch[]
  partnerId: EntityId | null
  union: Union | null
}

/**
 * The whole family as nested lines of descent, from its oldest founders down —
 * the tree a screen reader walks as a list. Everyone appears once in full:
 * by descent, or beside the partner they married into the family; whoever
 * neither reaches starts a branch of their own at the end.
 */
export const familyOutline = (lineage: FamilyLineage): OutlineBranch[] => {
  const written = new Set<EntityId>()
  const shownAsPartner = new Set<EntityId>()

  const branchOf = (personId: EntityId): OutlineBranch => {
    if (written.has(personId)) {
      return { couples: [], isRepeated: true, personId }
    }
    written.add(personId)

    const couples = couplesOf(lineage, personId).map(
      ({ children, partnerId, union }) => {
        if (partnerId !== null) shownAsPartner.add(partnerId)
        return {
          children: children.map(({ childId }) => branchOf(childId)),
          partnerId,
          union
        }
      }
    )

    return { couples, isRepeated: false, personId }
  }

  const founders = lineage.personIds
    .filter((personId) => lineage.parentLinksOf(personId).length === 0)
    .toSorted(
      (first, second) =>
        lineage.generationOf(first) - lineage.generationOf(second)
    )
  const isStillOut = (personId: EntityId) =>
    !written.has(personId) && !shownAsPartner.has(personId)

  const branches: OutlineBranch[] = []
  for (const personId of [...founders, ...lineage.personIds]) {
    if (isStillOut(personId)) branches.push(branchOf(personId))
  }

  return branches
}
