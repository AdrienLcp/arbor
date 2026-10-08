import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { FamilyLineage } from '../tree-layout/family-lineage'

/** A child of a couple: the link from the person the couple belongs to, and the links to its other parents. */
export type CoupleChild = {
  childId: EntityId
  filiation: Filiation
  otherParentFiliations: readonly Filiation[]
}

/**
 * Someone a person had a union or a child with. A recorded union comes with
 * its kind and end; two parents of a child who never recorded one have none.
 */
export type Couple = {
  children: readonly CoupleChild[]
  /** `null` when the other partner, or the child's other parent, is unknown. */
  partnerId: EntityId | null
  union: Union | null
}

const otherPartnerOf = (union: Union, personId: EntityId): EntityId | null => {
  const [first, second] = union.partnerIds
  return first === personId ? second : first
}

/**
 * A person's couples: their unions in the order they were recorded, then the
 * other parents of children born outside any union, each child under the
 * couple it came from, eldest first.
 */
export const couplesOf = (
  lineage: FamilyLineage,
  personId: EntityId
): Couple[] => {
  const drafts = lineage
    .unionsOf(personId)
    .map((union): { children: CoupleChild[] } & Omit<Couple, 'children'> => ({
      children: [],
      partnerId: otherPartnerOf(union, personId),
      union
    }))

  for (const filiation of lineage.childLinksOf(personId)) {
    const otherParentFiliations = lineage
      .parentLinksOf(filiation.childId)
      .filter(({ parentId }) => parentId !== personId)
    const otherParentIds = otherParentFiliations.map(({ parentId }) => parentId)
    const child = {
      childId: filiation.childId,
      filiation,
      otherParentFiliations
    }
    const couple =
      drafts.find(
        ({ partnerId }) =>
          partnerId !== null && otherParentIds.includes(partnerId)
      ) ??
      (otherParentIds.length === 0
        ? drafts.find(({ partnerId }) => partnerId === null)
        : undefined)

    if (couple === undefined) {
      drafts.push({
        children: [child],
        partnerId: otherParentIds[0] ?? null,
        union: null
      })
    } else {
      couple.children.push(child)
    }
  }

  return drafts
}
