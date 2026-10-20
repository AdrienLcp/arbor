import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import type { Box } from './fit-view'
import type { TreeScene } from './tree-scene'

type Point = { x: number; y: number }

/** The box around every card of the scene, in the plane the canvas moves; `null` for a scene without cards. */
export const treeBoxOf = ({ layout, origin }: TreeScene): Box | null => {
  if (layout.cards.length === 0) return null
  return {
    bottom:
      Math.max(...layout.cards.map(({ y }) => y + CARD_HEIGHT)) - origin.y,
    left: Math.min(...layout.cards.map(({ x }) => x)) - origin.x,
    right: Math.max(...layout.cards.map(({ x }) => x + CARD_WIDTH)) - origin.x,
    top: Math.min(...layout.cards.map(({ y }) => y)) - origin.y
  }
}

/** Where the plane may go so the tree still covers `sightCentre`: dragged too far, its edge stops at the middle of what is in sight. */
export const keepTreeInSight = ({
  position,
  scale,
  sightCentre,
  tree
}: {
  position: Point
  scale: number
  sightCentre: Point
  tree: Box
}): Point => ({
  x: Math.min(
    sightCentre.x - tree.left * scale,
    Math.max(sightCentre.x - tree.right * scale, position.x)
  ),
  y: Math.min(
    sightCentre.y - tree.top * scale,
    Math.max(sightCentre.y - tree.bottom * scale, position.y)
  )
})
