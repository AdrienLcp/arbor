import { type HierarchyPointNode, hierarchy, tree } from 'd3-hierarchy'

import { SIBLING_BLOCK_GAP, slotsWidth } from './tree-metrics'

/**
 * Spreads blocks of cards with d3's tidy tree: sibling blocks a gap apart,
 * cousins twice that. Only `x` is meant to be read — rows come from
 * generations, not from depth in the tree.
 */
export const tidyTree = <Block extends { slots: readonly unknown[] }>({
  childrenOf,
  root,
  spaceBefore = () => 0,
  widthOf = (block) => slotsWidth(block.slots.length)
}: {
  childrenOf: (block: Block) => readonly Block[]
  root: Block
  /** Room left free on a block's left on top of the usual gap. */
  spaceBefore?: (block: Block) => number
  widthOf?: (block: Block) => number
}): HierarchyPointNode<Block> =>
  tree<Block>()
    .nodeSize([1, 1])
    .separation(
      (left, right) =>
        (widthOf(left.data) + widthOf(right.data)) / 2 +
        (left.parent === right.parent
          ? SIBLING_BLOCK_GAP
          : SIBLING_BLOCK_GAP * 2) +
        spaceBefore(right.data)
    )(hierarchy(root, childrenOf))
