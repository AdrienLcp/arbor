import type { Filiation, FiliationKind } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { TreeConnector } from '@arbor/core/tree-layout/tree-layout'

/** How a relation line is stroked: the kind of a link is told by its stroke, never by its colour (The Line Speaks Rule). */
export type LineStyle =
  | 'adoption'
  | 'free-union'
  | 'marriage'
  | 'plain'
  | 'step'
  | 'unknown'

const UNION_LINE = {
  marriage: 'marriage',
  pacs: 'marriage',
  partnership: 'free-union',
  unknown: 'plain'
} as const satisfies Record<Union['kind'], LineStyle>

const DESCENT_LINE = {
  adoption: 'adoption',
  birth: 'plain',
  foster: 'step',
  step: 'step',
  unknown: 'unknown'
} as const satisfies Record<FiliationKind, LineStyle>

/** Most telling first: a child born to one parent and adopted by the other hangs by an adoption line. */
const TELLING_ORDER: readonly FiliationKind[] = [
  'adoption',
  'step',
  'foster',
  'birth',
  'unknown'
]

/** The kind a line to a child is drawn for, out of the child's filiations to the parents above. */
export const tellingFiliationKind = (
  filiations: readonly Filiation[]
): FiliationKind =>
  TELLING_ORDER.find((kind) =>
    filiations.some((filiation) => filiation.kind === kind)
  ) ?? 'unknown'

export const lineStyleOf = (connector: TreeConnector): LineStyle => {
  switch (connector.kind) {
    case 'union':
      return connector.union === null
        ? 'unknown'
        : UNION_LINE[connector.union.kind]
    case 'siblings':
      return 'plain'
    case 'descent':
      return DESCENT_LINE[tellingFiliationKind(connector.filiations)]
    default:
      return connector satisfies never
  }
}
