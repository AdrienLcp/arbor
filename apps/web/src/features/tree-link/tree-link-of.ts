import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import type { Occurrence } from '@arbor/protocol/occurrence'
import type { Union } from '@arbor/protocol/union'

import type { FamilyState } from '@arbor/core/family/family-state'
import type { ExistingRelativeLink } from '@arbor/core/relatives/existing-relative-link'

import type { TreeLinkKind } from './tree-link-step'

/** How a couple began and how a child is tied, as the confirmation sets them. */
export type TreeLinkDetails = {
  filiationKind: FiliationKind
  unionKind: Union['kind']
  unionStart: Occurrence | null
}

const hasKnownParent = (family: FamilyState, personId: EntityId) =>
  family.filiations.values().some(({ childId }) => childId === personId)

/** A child who already has two parents by birth most likely gains a step-parent. */
export const defaultFiliationKind = (
  family: FamilyState,
  childId: EntityId
): FiliationKind =>
  family.filiations
    .values()
    .filter(({ childId: id, kind }) => id === childId && kind === 'birth')
    .toArray().length >= 2
    ? 'step'
    : 'birth'

/** The details a link takes until the confirmation changes them: a marriage with no date, a birth unless the child has two birth parents. */
export const defaultTreeLinkDetails = (
  family: FamilyState,
  secondId: EntityId
): TreeLinkDetails => ({
  filiationKind: defaultFiliationKind(family, secondId),
  unionKind: 'marriage',
  unionStart: null
})

/**
 * The tie between the two people touched, in the terms of the "already in the
 * tree" form. A parent is touched before their child. A brother or a sister
 * becomes a child of the other's parents, so the one whose parents are known
 * anchors the link, whichever was touched first.
 */
export const treeLinkOf = ({
  details,
  family,
  firstId,
  kind,
  secondId
}: {
  details: TreeLinkDetails
  family: FamilyState
  firstId: EntityId
  kind: TreeLinkKind
  secondId: EntityId
}): ExistingRelativeLink => {
  switch (kind) {
    case 'couple':
      return {
        anchorId: firstId,
        kind: details.unionKind,
        relation: 'partner',
        relativeId: secondId,
        start: details.unionStart
      }
    case 'parentChild':
      return {
        anchorId: firstId,
        kind: details.filiationKind,
        relation: 'child',
        relativeId: secondId
      }
    case 'siblings':
      return hasKnownParent(family, firstId) ||
        !hasKnownParent(family, secondId)
        ? { anchorId: firstId, relation: 'sibling', relativeId: secondId }
        : { anchorId: secondId, relation: 'sibling', relativeId: firstId }
  }
}
