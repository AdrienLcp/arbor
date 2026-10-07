import type { TreePoint } from './tree-layout'
import { CARD_HEIGHT, CARD_WIDTH, PARTNER_GAP } from './tree-metrics'

const BRACKET_RISE = 24
const BRACKET_STAGGER = 6
const BAR_DROP = 24
const BAR_STAGGER = 10

/**
 * The line joining two partners in a row, and the point their children hang
 * from. Neighbours are joined across the gap between them; partners further
 * apart by a bracket above the cards, staggered so brackets never merge.
 */
export const unionPath = ({
  firstLeft,
  secondLeft,
  stagger,
  y
}: {
  firstLeft: number
  secondLeft: number
  stagger: number
  y: number
}): { anchor: TreePoint; points: TreePoint[] } => {
  const leftmost = Math.min(firstLeft, secondLeft)
  const rightmost = Math.max(firstLeft, secondLeft)
  const middleY = y + CARD_HEIGHT / 2

  if (rightmost - leftmost === CARD_WIDTH + PARTNER_GAP) {
    const from = { x: leftmost + CARD_WIDTH, y: middleY }
    const to = { x: rightmost, y: middleY }
    return {
      anchor: { x: (from.x + to.x) / 2, y: middleY },
      points: [from, to]
    }
  }

  const top = y - BRACKET_RISE - stagger * BRACKET_STAGGER
  const firstCenter = firstLeft + CARD_WIDTH / 2
  const secondCenter = secondLeft + CARD_WIDTH / 2
  return {
    anchor: { x: secondCenter, y: y + CARD_HEIGHT },
    points: [
      { x: firstCenter, y },
      { x: firstCenter, y: top },
      { x: secondCenter, y: top },
      { x: secondCenter, y }
    ]
  }
}

/** The height of the bar the children of one union hang from, under the parents' row. */
export const siblingBarY = ({ stagger, y }: { stagger: number; y: number }) =>
  y + CARD_HEIGHT + BAR_DROP + stagger * BAR_STAGGER

/** From the parents' anchor down to the bar, across, and down to the child's card. */
export const descentPath = ({
  anchor,
  barY,
  child
}: {
  anchor: TreePoint
  barY: number
  child: TreePoint
}): TreePoint[] =>
  anchor.x === child.x
    ? [anchor, child]
    : [anchor, { x: anchor.x, y: barY }, { x: child.x, y: barY }, child]
