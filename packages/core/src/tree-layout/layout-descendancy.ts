import type { EntityId } from '@arbor/protocol/entity-id'

import { slotCards } from './block-slots'
import { siblingBarY, unionPath } from './connector-paths'
import { type DescendancyBlock, descendancyBlocks } from './descendancy-blocks'
import type { FamilyLineage } from './family-lineage'
import { tidyTree } from './tidy-tree'
import type { TreeConnector, TreeLayout } from './tree-layout'
import { CARD_WIDTH, rowY, slotLeft, slotsWidth } from './tree-metrics'

const childrenOf = (block: DescendancyBlock) =>
  block.groups.flatMap((group) => group.children.map(({ block }) => block))

/** `rootId` and their descendants down to `depth` generations, partners beside them. */
export const layoutDescendancy = ({
  depth,
  lineage,
  rootId
}: {
  depth: number
  lineage: FamilyLineage
  rootId: EntityId
}): TreeLayout => {
  const root = tidyTree({
    childrenOf,
    root: descendancyBlocks({ depth, lineage, rootId })
  })

  const nodes = root.descendants()
  const leftOf = new Map(
    nodes.map((node) => [
      node.data,
      node.x - slotsWidth(node.data.slots.length) / 2
    ])
  )
  const selfCenterOf = (block: DescendancyBlock) =>
    slotLeft({ index: block.selfSlotIndex, left: leftOf.get(block) ?? 0 }) +
    CARD_WIDTH / 2

  const cards = nodes.flatMap(({ data: block }) =>
    slotCards({
      blockKey: block.personId,
      generation: block.generation,
      left: leftOf.get(block) ?? 0,
      lineage,
      slots: block.slots,
      y: rowY(block.generation)
    })
  )

  const connectors = nodes.flatMap(({ data: block }): TreeConnector[] => {
    const left = leftOf.get(block) ?? 0
    const y = rowY(block.generation)

    return block.groups.flatMap((group, stagger) => {
      const { anchor, points } = unionPath({
        firstLeft: slotLeft({ index: block.selfSlotIndex, left }),
        secondLeft: slotLeft({ index: group.partnerSlotIndex, left }),
        stagger,
        y
      })
      const union: TreeConnector = { kind: 'union', points, union: group.union }
      if (group.children.length === 0) return [union]

      const barY = siblingBarY({ stagger, y })
      const children = group.children.map(({ block: child, filiations }) => ({
        child,
        filiations,
        x: selfCenterOf(child)
      }))
      const childXs = children.map(({ x }) => x)
      return [
        union,
        { kind: 'siblings', points: [anchor, { x: anchor.x, y: barY }] },
        {
          kind: 'siblings',
          points: [
            { x: Math.min(anchor.x, ...childXs), y: barY },
            { x: Math.max(anchor.x, ...childXs), y: barY }
          ]
        },
        ...children.map(
          ({ child, filiations, x }): TreeConnector => ({
            childId: child.personId,
            filiations,
            kind: 'descent',
            points: [
              { x, y: barY },
              { x, y: rowY(child.generation) }
            ]
          })
        )
      ]
    })
  })

  return { cards, connectors }
}
