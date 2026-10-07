import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'

export type ArrowDirection = 'down' | 'left' | 'right' | 'up'

const ARROW_DIRECTIONS = {
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up'
} as const satisfies Record<string, ArrowDirection>

const isArrowKey = (key: string): key is keyof typeof ARROW_DIRECTIONS =>
  Object.hasOwn(ARROW_DIRECTIONS, key)

/** The direction an arrow key points, `null` for any other key. */
export const arrowDirectionOf = (key: string): ArrowDirection | null =>
  isArrowKey(key) ? ARROW_DIRECTIONS[key] : null

type Distance = { across: number; along: number }

const distanceToward = (
  direction: ArrowDirection,
  { from, to }: { from: TreeCard; to: TreeCard }
): Distance | null => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  switch (direction) {
    case 'left':
    case 'right': {
      const along = direction === 'right' ? dx : -dx
      return dy === 0 && along > 0 ? { across: 0, along } : null
    }
    case 'up':
    case 'down': {
      const along = direction === 'down' ? dy : -dy
      return along > 0 ? { across: Math.abs(dx), along } : null
    }
    default:
      return direction satisfies never
  }
}

const isCloser = (candidate: Distance, best: Distance) =>
  candidate.along < best.along ||
  (candidate.along === best.along && candidate.across < best.across)

/**
 * The card an arrow key moves to. Left and right stay on the row; up and
 * down go to the nearest row that way, then to the card closest in line.
 */
export const nearestCardToward = ({
  cards,
  direction,
  from
}: {
  cards: readonly TreeCard[]
  direction: ArrowDirection
  from: TreeCard
}): TreeCard | null => {
  let nearest: { card: TreeCard; distance: Distance } | null = null

  for (const card of cards) {
    const distance = distanceToward(direction, { from, to: card })
    if (
      distance !== null &&
      (nearest === null || isCloser(distance, nearest.distance))
    ) {
      nearest = { card, distance }
    }
  }

  return nearest?.card ?? null
}
