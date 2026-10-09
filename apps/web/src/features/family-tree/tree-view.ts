import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { layoutAroundPerson } from '@arbor/core/tree-layout/layout-around-person'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'
import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'

/**
 * What the tree shows:
 * - `'around'` — the focus person's ancestors above and descendants below, `depth` generations each way
 * - `'whole'` — the family as a descendancy from its widest founder
 * - `'list'` — the whole family as nested lists, the drawing's accessible twin
 *
 * A phone draws no canvas: it shows the focus person's page for both drawings.
 */
export type TreeScope = 'around' | 'list' | 'whole'

export type TreeView = {
  depth: number
  /** The person the tree turns around: the foil sticker, the one the canvas centres on. */
  focusId: EntityId
  /** Whether the drawing lays a band under each generation; off by default, as most family trees are drawn. */
  hasGenerationBands: boolean
  scope: TreeScope
}

export const TREE_DEPTHS = [1, 2, 3, 4] as const
export const DEFAULT_TREE_DEPTH = 2

/** The layout a view draws; a focus person since binned falls back to the whole family. */
export const layoutOfView = (
  family: FamilyState,
  { depth, focusId, scope }: TreeView
): TreeLayout => {
  if (scope !== 'around') {
    return layoutWholeFamily(family)
  }

  const around = layoutAroundPerson(family, {
    focusId,
    generationsDown: depth,
    generationsUp: depth
  })

  return around.status === 'success' ? around.data : layoutWholeFamily(family)
}

/** Whether a person is drawn in the tree: recorded, and not in the bin. */
export const isInTree = (family: FamilyState, personId: EntityId): boolean =>
  family.persons.has(personId) && !family.binnedPersonIds.has(personId)

/** Who the tree turns around on arrival: the visitor when they are in it, else the top of the whole family. */
export const firstFocusId = ({
  family,
  me
}: {
  family: FamilyState
  me: EntityId | null
}): EntityId | null => {
  if (me !== null && isInTree(family, me)) return me

  const root = layoutWholeFamily(family).cards.find(
    (card) => card.kind === 'person'
  )

  return root?.kind === 'person' ? root.personId : null
}
