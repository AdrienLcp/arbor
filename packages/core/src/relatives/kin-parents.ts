import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'

import type { FamilyLineage } from '../tree-layout/family-lineage'

type RaisingLink = Filiation & { kind: 'foster' | 'step' }

/** A step or foster parent raises a child without making them kin to that parent's other children. */
export const isRaisingLink = (link: Filiation): link is RaisingLink =>
  link.kind === 'step' || link.kind === 'foster'

/** A link by birth, adoption or of an unknown kind: the ones blood relations are counted through. */
export const isKinLink = (link: Filiation): boolean => !isRaisingLink(link)

export const kinParentIdsOf = (
  lineage: FamilyLineage,
  personId: EntityId
): Set<EntityId> =>
  new Set(
    lineage
      .parentLinksOf(personId)
      .filter(isKinLink)
      .map(({ parentId }) => parentId)
  )

/** Whether two people have the same parents by birth or adoption — two brothers rather than half-brothers. */
export const haveSameKinParents = (
  lineage: FamilyLineage,
  { firstId, secondId }: { firstId: EntityId; secondId: EntityId }
): boolean => {
  const firstParents = kinParentIdsOf(lineage, firstId)
  const secondParents = kinParentIdsOf(lineage, secondId)
  return (
    firstParents.size === secondParents.size &&
    [...firstParents].every((parentId) => secondParents.has(parentId))
  )
}
