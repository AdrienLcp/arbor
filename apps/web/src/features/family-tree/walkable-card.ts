import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'

/** A card the visitor can press and reach with the arrow keys: every person, and an unknown parent's slot when they may fill it in. */
export const isWalkableCard = (
  card: TreeCard,
  { canFillIn }: { canFillIn: boolean }
): boolean => card.kind === 'person' || (canFillIn && card.childIds.length > 0)
