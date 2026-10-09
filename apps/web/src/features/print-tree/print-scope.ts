import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { layoutAroundPerson } from '@arbor/core/tree-layout/layout-around-person'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'
import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'

/** How many generations a line goes back or down; `'all'` follows it to its end. */
export type PrintDepth = 'all' | 2 | 3 | 4 | 5
export const PRINT_DEPTHS = [
  2,
  3,
  4,
  5,
  'all'
] as const satisfies readonly PrintDepth[]
export const DEFAULT_PRINT_DEPTH: PrintDepth = 3

/** Who goes on the sheet: the whole family, or one person's line upwards or downwards. */
export type PrintScope =
  | { kind: 'whole' }
  | { depth: PrintDepth; kind: 'ancestors' | 'descendants'; personId: EntityId }

const generationsOf = (depth: PrintDepth): number =>
  depth === 'all' ? Number.POSITIVE_INFINITY : depth

/** The layout a scope prints; a person since binned falls back to the whole family. */
export const layoutOfPrintScope = (
  family: FamilyState,
  scope: PrintScope
): TreeLayout => {
  if (scope.kind === 'whole') {
    return layoutWholeFamily(family)
  }

  const generations = generationsOf(scope.depth)
  const line = layoutAroundPerson(family, {
    focusId: scope.personId,
    generationsDown: scope.kind === 'descendants' ? generations : 0,
    generationsUp: scope.kind === 'ancestors' ? generations : 0
  })

  return line.status === 'success' ? line.data : layoutWholeFamily(family)
}
