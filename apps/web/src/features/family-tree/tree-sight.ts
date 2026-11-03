import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import type { Box } from './fit-view'
import type { TreeScene } from './tree-scene'

type Point = { x: number; y: number }

const boxAroundCards = (cards: readonly Point[], origin: Point): Box | null => {
  if (cards.length === 0) return null
  return {
    bottom: Math.max(...cards.map(({ y }) => y + CARD_HEIGHT)) - origin.y,
    left: Math.min(...cards.map(({ x }) => x)) - origin.x,
    right: Math.max(...cards.map(({ x }) => x + CARD_WIDTH)) - origin.x,
    top: Math.min(...cards.map(({ y }) => y)) - origin.y
  }
}

/** The box around every card of the scene, in the plane the canvas moves; `null` for a scene without cards. */
export const treeBoxOf = ({ layout, origin }: TreeScene): Box | null =>
  boxAroundCards(layout.cards, origin)

/** The box of the card drawn under `key`, in the plane the canvas moves; `null` when the scene draws none. */
export const cardBoxOf = (
  { layout, origin }: TreeScene,
  key: string
): Box | null =>
  boxAroundCards(
    layout.cards.filter((card) => card.key === key),
    origin
  )

/** Along one axis, the plane's positions where the tree covers the middle of what is in sight, or, when it is no longer than what is in sight, lies whole within it. */
const keptAlong = ({
  position,
  scale,
  sightEnd,
  sightStart,
  treeEnd,
  treeStart
}: {
  position: number
  scale: number
  sightEnd: number
  sightStart: number
  treeEnd: number
  treeStart: number
}): number => {
  const middle = (sightStart + sightEnd) / 2
  const fitsWhole = (treeEnd - treeStart) * scale <= sightEnd - sightStart
  const lowest = middle - treeEnd * scale
  const highest = middle - treeStart * scale
  return Math.min(
    fitsWhole ? Math.max(highest, sightEnd - treeEnd * scale) : highest,
    Math.max(
      fitsWhole ? Math.min(lowest, sightStart - treeStart * scale) : lowest,
      position
    )
  )
}

/** Where the plane may go so the tree stays in `sight`: dragged too far, its edge stops at the middle of what is in sight, or at its edge for a tree small enough to show whole. */
export const keepTreeInSight = ({
  position,
  scale,
  sight,
  tree
}: {
  position: Point
  scale: number
  sight: Box
  tree: Box
}): Point => ({
  x: keptAlong({
    position: position.x,
    scale,
    sightEnd: sight.right,
    sightStart: sight.left,
    treeEnd: tree.right,
    treeStart: tree.left
  }),
  y: keptAlong({
    position: position.y,
    scale,
    sightEnd: sight.bottom,
    sightStart: sight.top,
    treeEnd: tree.bottom,
    treeStart: tree.top
  })
})
