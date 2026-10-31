import type { FiliationKind } from '@arbor/protocol/filiation'

import type { ExistingRelativeLink } from '@arbor/core/relatives/existing-relative-link'
import type { Relation } from '@arbor/core/relatives/relation'

/**
 * How someone already in the tree is tied to the person, as the add dialog
 * asks it: a couple starts with its kind left to say ("en couple") and no
 * date, both corrected later on the union.
 */
export const existingTie = ({
  anchorId,
  kind,
  relation,
  relativeId
}: {
  anchorId: string
  /** The child's or the parent's link; ignored for a partner or a sibling. */
  kind: FiliationKind
  relation: Relation
  relativeId: string
}): ExistingRelativeLink => {
  const ends = { anchorId, relativeId }
  switch (relation) {
    case 'child':
    case 'parent':
      return { ...ends, kind, relation }
    case 'partner':
      return { ...ends, kind: 'unknown', relation, start: null }
    case 'sibling':
      return { ...ends, relation }
    default:
      return relation satisfies never
  }
}
