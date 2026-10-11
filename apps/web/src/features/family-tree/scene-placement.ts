import type { EntityId } from '@arbor/protocol/entity-id'

import type { TreeScene } from './tree-scene'

/**
 * Where the tree stands: its middle and every card's place. Two scenes with one
 * placement draw the same tree, whichever render built them, so the canvas
 * leaves the view where the visitor put it.
 */
export const placementOf = (scene: TreeScene, focusId: EntityId): string =>
  [
    focusId,
    `${scene.origin.x},${scene.origin.y}`,
    ...scene.layout.cards.map(({ key, x, y }) => `${key}@${x},${y}`)
  ].join(' ')
