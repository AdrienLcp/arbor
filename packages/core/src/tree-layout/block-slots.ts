import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyLineage } from './family-lineage'
import type { TreeCard } from './tree-layout'
import { slotLeft } from './tree-metrics'

/** One place in a row of cards drawn together: a person, or an unknown other parent. */
export type BlockSlot =
  | {
      /** Already drawn elsewhere in the layout. */
      isRepeated: boolean
      kind: 'person'
      personId: EntityId
    }
  | { kind: 'unknown-parent' }

/** The cards of a block whose first slot starts at `left`; `blockKey` keeps the keys of repeats and unknown parents unique. */
export const slotCards = ({
  blockKey,
  generation,
  left,
  lineage,
  slots,
  y
}: {
  blockKey: string
  generation: number
  left: number
  lineage: FamilyLineage
  slots: readonly BlockSlot[]
  y: number
}): TreeCard[] =>
  slots.map((slot, index) => {
    const x = slotLeft({ index, left })
    if (slot.kind === 'unknown-parent') {
      return {
        generation,
        key: `unknown-parent@${blockKey}#${index}`,
        kind: 'unknown-parent',
        x,
        y
      }
    }
    return {
      generation: lineage.generationOf(slot.personId),
      isRepeated: slot.isRepeated,
      key: slot.isRepeated ? `${slot.personId}@${blockKey}` : slot.personId,
      kind: 'person',
      personId: slot.personId,
      x,
      y
    }
  })
