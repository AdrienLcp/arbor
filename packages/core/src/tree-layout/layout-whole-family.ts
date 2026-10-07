import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '../family/family-state'
import { type FamilyLineage, familyLineage } from './family-lineage'
import { layoutDescendancy } from './layout-descendancy'
import { EMPTY_TREE_LAYOUT, type TreeLayout } from './tree-layout'

const descendantCount = (lineage: FamilyLineage, personId: EntityId) => {
  const reached = new Set<EntityId>()
  const toVisit = [personId]
  for (
    let current = toVisit.pop();
    current !== undefined;
    current = toVisit.pop()
  ) {
    for (const { childId } of lineage.childLinksOf(current)) {
      if (reached.has(childId)) continue
      reached.add(childId)
      toVisit.push(childId)
    }
  }
  return reached.size
}

/** Whoever has no known parent and the most descendants: the top of the keeper's paper tree. */
export const wholeFamilyRoot = (lineage: FamilyLineage): EntityId | null => {
  const founders = lineage.personIds
    .filter((personId) => lineage.parentLinksOf(personId).length === 0)
    .map((personId) => ({
      count: descendantCount(lineage, personId),
      personId
    }))
  const [widest] = founders.toSorted((left, right) => right.count - left.count)
  return widest?.personId ?? null
}

/**
 * The family as a descendancy from its widest founder. The parents of
 * someone who married in are not drawn: that person's card refocuses on them.
 */
export const layoutWholeFamily = (family: FamilyState): TreeLayout => {
  const lineage = familyLineage(family)
  const rootId = wholeFamilyRoot(lineage)
  if (rootId === null) return EMPTY_TREE_LAYOUT
  return layoutDescendancy({ depth: Number.POSITIVE_INFINITY, lineage, rootId })
}
