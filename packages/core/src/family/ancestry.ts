import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from './family-state'

/** Whether `ancestorId` is reached by climbing parents from `descendantId`, through any kind of filiation. */
export const isAncestor = (
  family: FamilyState,
  { ancestorId, descendantId }: { ancestorId: EntityId; descendantId: EntityId }
): boolean => {
  const parentsByChild = Map.groupBy(
    family.filiations.values(),
    (filiation) => filiation.childId
  )
  const visited = new Set<EntityId>()
  const toVisit = [descendantId]

  for (
    let current = toVisit.pop();
    current !== undefined;
    current = toVisit.pop()
  ) {
    for (const { parentId } of parentsByChild.get(current) ?? []) {
      if (parentId === ancestorId) return true
      if (!visited.has(parentId)) {
        visited.add(parentId)
        toVisit.push(parentId)
      }
    }
  }
  return false
}
