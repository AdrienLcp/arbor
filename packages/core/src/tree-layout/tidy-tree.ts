import { type HierarchyPointNode, hierarchy, tree } from 'd3-hierarchy'

import { SIBLING_BLOCK_GAP, slotsWidth } from './tree-metrics'

/**
 * Spreads blocks of cards with d3's tidy tree: sibling blocks a gap apart,
 * cousins twice that. Only `x` is meant to be read — rows come from
 * generations, not from depth in the tree.
 */
export const tidyTree = <Block extends { slots: readonly unknown[] }>({
  childrenOf,
  root
}: {
  childrenOf: (block: Block) => readonly Block[]
  root: Block
}): HierarchyPointNode<Block> =>
  tree<Block>()
    .nodeSize([1, 1])
    .separation(
      (left, right) =>
        (slotsWidth(left.data.slots.length) +
          slotsWidth(right.data.slots.length)) /
          2 +
        (left.parent === right.parent
          ? SIBLING_BLOCK_GAP
          : SIBLING_BLOCK_GAP * 2)
    )(hierarchy(root, childrenOf))
