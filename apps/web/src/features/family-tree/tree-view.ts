import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { layoutAroundPerson } from '@arbor/core/tree-layout/layout-around-person'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'
import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'

/**
 * What the canvas shows:
 * - `'around'` — the focus person's ancestors above and descendants below, `depth` generations each way
 * - `'whole'` — the family as a descendancy from its widest founder
 */
export type TreeScope = 'around' | 'whole'

export type TreeView = {
  depth: number
  /** The person the tree turns around: the foil sticker, the one the canvas centres on. */
  focusId: EntityId
  scope: TreeScope
}

export const TREE_DEPTHS = [1, 2, 3, 4] as const
export const DEFAULT_TREE_DEPTH = 2

/** The layout a view draws; a focus person since binned falls back to the whole family. */
export const layoutOfView = (
  family: FamilyState,
  { depth, focusId, scope }: TreeView
): TreeLayout => {
  if (scope === 'whole') {
    return layoutWholeFamily(family)
  }

  const around = layoutAroundPerson(family, {
    focusId,
    generationsDown: depth,
    generationsUp: depth
  })

  return around.status === 'success' ? around.data : layoutWholeFamily(family)
}

/** Who the tree turns around on arrival: the visitor when they are in it, else the top of the whole family. */
export const firstFocusId = ({
  family,
  me
}: {
  family: FamilyState
  me: EntityId | null
}): EntityId | null => {
  if (
    me !== null &&
    family.persons.has(me) &&
    !family.binnedPersonIds.has(me)
  ) {
    return me
  }

  const root = layoutWholeFamily(family).cards.find(
    (card) => card.kind === 'person'
  )

  return root?.kind === 'person' ? root.personId : null
}
