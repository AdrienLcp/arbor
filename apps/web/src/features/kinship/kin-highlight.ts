import type { EntityId } from '@arbor/protocol/entity-id'

import type { KinPath } from '@arbor/core/kinship/kinship'
import type {
  TreeCard,
  TreeLayout,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

type PersonCard = Extract<TreeCard, { kind: 'person' }>

/** The card a person is drawn on: their own one, not a repeat a second link reaches. */
const cardsByPerson = (
  layout: TreeLayout
): ReadonlyMap<EntityId, PersonCard> => {
  const cards = new Map<EntityId, PersonCard>()
  for (const card of layout.cards) {
    if (card.kind !== 'person') continue
    const known = cards.get(card.personId)
    if (known === undefined || (known.isRepeated && !card.isRepeated)) {
      cards.set(card.personId, card)
    }
  }
  return cards
}

const middleOf = ({ x, y }: PersonCard): TreePoint => ({
  x: x + CARD_WIDTH / 2,
  y: y + CARD_HEIGHT / 2
})

/** From one card to the next: straight between partners side by side, else down to halfway, across, and down again. */
const strokeBetween = (from: PersonCard, to: PersonCard): TreePoint[] => {
  const start = middleOf(from)
  const end = middleOf(to)
  if (from.y === to.y) return [start, end]

  const [upper, lower] = from.y < to.y ? [from, to] : [to, from]
  const halfway = (upper.y + CARD_HEIGHT + lower.y) / 2
  return [start, { x: start.x, y: halfway }, { x: end.x, y: halfway }, end]
}

/**
 * The cards a kinship path lights up, and the marker strokes that join them
 * on the tree. A step between two people the layout does not both draw is
 * left out.
 */
export const kinHighlightOf = (
  layout: TreeLayout,
  path: KinPath
): { cardKeys: ReadonlySet<string>; strokes: readonly TreePoint[][] } => {
  const cards = cardsByPerson(layout)
  const pathCards = path.map((personId) => cards.get(personId))

  return {
    cardKeys: new Set(pathCards.flatMap((card) => card?.key ?? [])),
    strokes: pathCards.slice(1).flatMap((to, index) => {
      const from = pathCards[index]
      return from === undefined || to === undefined
        ? []
        : [strokeBetween(from, to)]
    })
  }
}
