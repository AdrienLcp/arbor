import type { TreePoint } from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT } from '@arbor/core/tree-layout/tree-metrics'

/** Below the partners' row, where the word of a union between neighbours hangs. */
const WORDS_BELOW_CARDS = 22

const middleOf = (from: TreePoint, to: TreePoint): TreePoint => ({
  x: (from.x + to.x) / 2,
  y: (from.y + to.y) / 2
})

/** The middle of a union line: where a divorce or a separation cuts it. Between neighbours, the gap; for a bracket, its top. */
export const unionMiddle = (points: readonly TreePoint[]): TreePoint => {
  const [first, second, third] = points
  if (first === undefined || second === undefined) return { x: 0, y: 0 }
  return third === undefined ? middleOf(first, second) : middleOf(second, third)
}

/**
 * Where a union's word sits, and the stub that hangs it from the line. The
 * gap between neighbours is too narrow for a word, so it hangs under their
 * row; a bracket carries its word on its top.
 */
export const unionWordsPlace = (
  points: readonly TreePoint[]
): { at: TreePoint; stub: readonly TreePoint[] | null } => {
  const middle = unionMiddle(points)

  if (points.length !== 2) {
    return { at: middle, stub: null }
  }

  const at = { x: middle.x, y: middle.y + CARD_HEIGHT / 2 + WORDS_BELOW_CARDS }
  return { at, stub: [middle, at] }
}
