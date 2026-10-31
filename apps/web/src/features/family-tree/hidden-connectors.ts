import type { EntityId } from '@arbor/protocol/entity-id'

import type {
  TreeCard,
  TreeConnector,
  TreeLayout,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

/** A person's card hides with them; an unknown parent's empty slot, with the children it stands beside. */
export const isCardHidden = (
  card: TreeCard,
  hiddenIds: ReadonlySet<EntityId>
): boolean =>
  card.kind === 'person'
    ? hiddenIds.has(card.personId)
    : card.childIds.every((childId) => hiddenIds.has(childId))

const touches = (card: TreeCard, { x, y }: TreePoint): boolean =>
  x >= card.x &&
  x <= card.x + CARD_WIDTH &&
  y >= card.y &&
  y <= card.y + CARD_HEIGHT

const isBetween = (value: number, ends: readonly number[]) =>
  value >= Math.min(...ends) && value <= Math.max(...ends)

/**
 * The lines that lead to someone hidden: a child's drop, a union with a
 * hidden partner, and the bar of a family whose children are all hidden.
 * Drawn faded while choosing who to show, so the tree does not move.
 */
export const hiddenConnectors = (
  { cards, connectors }: TreeLayout,
  hiddenIds: ReadonlySet<EntityId>
): ReadonlySet<TreeConnector> => {
  const hiddenCards = cards.filter((card) => isCardHidden(card, hiddenIds))
  const endsAtHiddenCard = (points: readonly TreePoint[]) =>
    [points[0], points.at(-1)].some(
      (point) =>
        point !== undefined && hiddenCards.some((card) => touches(card, point))
    )

  const hiddenLines = new Set(
    connectors.filter((connector) => {
      switch (connector.kind) {
        case 'descent':
          return hiddenIds.has(connector.childId)
        case 'union':
          return connector.union === null
            ? endsAtHiddenCard(connector.points)
            : connector.union.partnerIds.some(
                (partnerId) => partnerId !== null && hiddenIds.has(partnerId)
              )
        case 'siblings':
          return false
        default:
          return connector satisfies never
      }
    })
  )

  // A family's bar and the stem above it go once every drop hanging from the bar does.
  const bars = connectors.filter(
    (connector) =>
      connector.kind === 'siblings' &&
      connector.points[0]?.y === connector.points.at(-1)?.y
  )
  for (const bar of bars) {
    const barY = bar.points[0]?.y
    const barXs = bar.points.map(({ x }) => x)
    const drops = connectors.filter(
      (connector) =>
        connector.kind === 'descent' &&
        connector.points[0]?.y === barY &&
        isBetween(connector.points[0]?.x ?? Number.NaN, barXs)
    )
    if (!drops.every((drop) => hiddenLines.has(drop))) continue
    hiddenLines.add(bar)
    for (const stem of connectors) {
      const foot = stem.points.at(-1)
      if (
        stem !== bar &&
        stem.kind === 'siblings' &&
        foot !== undefined &&
        foot.y === barY &&
        isBetween(foot.x, barXs)
      ) {
        hiddenLines.add(stem)
      }
    }
  }

  return hiddenLines
}
