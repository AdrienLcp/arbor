import type { TreeCard, TreeLayout, TreePoint } from './tree-layout'
import { CARD_HEIGHT, CARD_WIDTH, rowY } from './tree-metrics'

/** How far a line's end may sit from a card's edge and still belong to it. */
const END_TOLERANCE = 4
/** How far inside a card a line must reach to cross it. */
const CROSSING_MARGIN = 3

const holds = (card: TreeCard, { x, y }: TreePoint) =>
  x >= card.x - END_TOLERANCE &&
  x <= card.x + CARD_WIDTH + END_TOLERANCE &&
  y >= card.y - END_TOLERANCE &&
  y <= card.y + CARD_HEIGHT + END_TOLERANCE

/** Whether the segment enters the card, by Liang–Barsky clipping. */
const crosses = (card: TreeCard, from: TreePoint, to: TreePoint) => {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y
  const bounds = [
    [-deltaX, from.x - (card.x + CROSSING_MARGIN)],
    [deltaX, card.x + CARD_WIDTH - CROSSING_MARGIN - from.x],
    [-deltaY, from.y - (card.y + CROSSING_MARGIN)],
    [deltaY, card.y + CARD_HEIGHT - CROSSING_MARGIN - from.y]
  ] as const
  let enter = 0
  let leave = 1
  for (const [direction, distance] of bounds) {
    if (direction === 0) {
      if (distance < 0) return false
      continue
    }
    const ratio = distance / direction
    if (direction < 0) enter = Math.max(enter, ratio)
    else leave = Math.min(leave, ratio)
    if (enter > leave) return false
  }
  return enter < leave
}

/** What would make a layout misread: a card off its generation's row, two cards on top of each other, a line passing under a card. */
export const layoutDefects = ({ cards, connectors }: TreeLayout) => {
  const offTheirRow = cards
    .filter((card) => card.y !== rowY(card.generation))
    .map(({ key }) => key)

  const overlapping = cards.flatMap((card, index) =>
    cards
      .slice(index + 1)
      .filter(
        (other) =>
          Math.abs(card.x - other.x) < CARD_WIDTH &&
          Math.abs(card.y - other.y) < CARD_HEIGHT
      )
      .map((other) => `${card.key} / ${other.key}`)
  )

  const linesUnderCards = connectors.flatMap(({ kind, points }) => {
    const first = points.at(0)
    const last = points.at(-1)
    const ends = cards.filter(
      (card) =>
        (first !== undefined && holds(card, first)) ||
        (last !== undefined && holds(card, last))
    )
    return points.slice(1).flatMap((to, index) => {
      const from = points[index]
      if (from === undefined) return []
      return cards
        .filter((card) => !ends.includes(card) && crosses(card, from, to))
        .map((card) => `${kind} under ${card.key}`)
    })
  })

  const keys = cards.map(({ key }) => key)
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index)

  return { duplicateKeys, linesUnderCards, offTheirRow, overlapping }
}
