import type { EntityId } from '@arbor/protocol/entity-id'

import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'

/**
 * The number printed above each card, by card key. A person keeps the number
 * of their place in the family, whatever the view; an unknown parent's outline
 * is numbered after everyone, in the order the layout draws it.
 */
export const slotNumbersOf = ({
  layout,
  personIds
}: {
  layout: TreeLayout
  /** Everyone in the family, in the order they were added. */
  personIds: readonly EntityId[]
}): ReadonlyMap<string, number> => {
  const personNumbers = new Map(
    personIds.map((personId, index) => [personId, index + 1])
  )
  let nextOutline = personIds.length + 1

  return new Map(
    layout.cards.map((card) => {
      if (card.kind === 'person') {
        return [card.key, personNumbers.get(card.personId) ?? 0]
      }
      const outline = nextOutline
      nextOutline += 1
      return [card.key, outline]
    })
  )
}
