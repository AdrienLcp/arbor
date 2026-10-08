import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { FamilyLineage } from '../tree-layout/family-lineage'
import { type Couple, couplesOf } from './couples'

/**
 * How a brother or a sister is one:
 * - `'full'` — the same parents by birth or adoption
 * - `'half'` — one of them in common, the other not
 * - `'step'` — no parent in common but one who raised them both, as a step or foster parent
 */
export type SiblingKind = 'full' | 'half' | 'step'

export type Sibling = {
  kind: SiblingKind
  personId: EntityId
  /** A parent they share: the one a step-sibling was raised by, for a page to name. */
  sharedParentId: EntityId
}

/** The people one page of the album shows around a person: one generation up, their own, one down. */
export type CloseFamily = {
  couples: readonly Couple[]
  /** The links from the person to each known parent. */
  parentFiliations: readonly Filiation[]
  /** The union between the two parents, the latest when they recorded several. */
  parentsUnion: Union | null
  siblings: readonly Sibling[]
}

const hasSameMembers = (
  first: ReadonlySet<EntityId>,
  second: ReadonlySet<EntityId>
): boolean =>
  first.size === second.size && [...first].every((id) => second.has(id))

const unionBetween = (
  lineage: FamilyLineage,
  [first, second]: readonly EntityId[]
): Union | null => {
  if (first === undefined || second === undefined) return null
  return (
    lineage
      .unionsOf(first)
      .findLast(({ partnerIds }) => partnerIds.includes(second)) ?? null
  )
}

/** A step or foster parent raises a child without making them kin to that parent's other children. */
const isKinLink = ({ kind }: Filiation): boolean =>
  kind !== 'step' && kind !== 'foster'

const kinParentsOf = (
  lineage: FamilyLineage,
  personId: EntityId
): Set<EntityId> =>
  new Set(
    lineage
      .parentLinksOf(personId)
      .filter(isKinLink)
      .map(({ parentId }) => parentId)
  )

const siblingsOf = (
  lineage: FamilyLineage,
  personId: EntityId,
  parentIds: readonly EntityId[]
): Sibling[] => {
  const ownKinParents = kinParentsOf(lineage, personId)
  const sharedParents = new Map<EntityId, EntityId>()

  for (const parentId of parentIds) {
    for (const { childId } of lineage.childLinksOf(parentId)) {
      if (childId !== personId && !sharedParents.has(childId)) {
        sharedParents.set(childId, parentId)
      }
    }
  }

  return Array.from(sharedParents, ([siblingId, sharedParentId]) => {
    const siblingKinParents = kinParentsOf(lineage, siblingId)
    const commonKinParent = [...siblingKinParents].find((parentId) =>
      ownKinParents.has(parentId)
    )
    const kind: SiblingKind =
      commonKinParent === undefined
        ? 'step'
        : hasSameMembers(siblingKinParents, ownKinParents)
          ? 'full'
          : 'half'

    return {
      kind,
      personId: siblingId,
      sharedParentId: commonKinParent ?? sharedParentId
    }
  })
}

/** A person's parents, their own couples and children, and their brothers and sisters, out of the bin. */
export const closeFamilyOf = (
  lineage: FamilyLineage,
  personId: EntityId
): CloseFamily => {
  const parentFiliations = lineage.parentLinksOf(personId)
  const parentIds = parentFiliations.map(({ parentId }) => parentId)

  return {
    couples: couplesOf(lineage, personId),
    parentFiliations,
    parentsUnion: unionBetween(lineage, parentIds),
    siblings: siblingsOf(lineage, personId, parentIds)
  }
}
