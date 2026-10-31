import type { EntityId } from '@arbor/protocol/entity-id'

import { slotCards } from './block-slots'
import { siblingBarY, unionPath } from './connector-paths'
import {
  type DescendancyBlock,
  descendancyBlocks,
  type PartnerGroup
} from './descendancy-blocks'
import type { FamilyLineage } from './family-lineage'
import { tidyTree } from './tidy-tree'
import type { TreeConnector, TreeLayout } from './tree-layout'
import {
  CARD_WIDTH,
  type ExtraGaps,
  rowY,
  SIBLING_BLOCK_GAP,
  slotLeft,
  slotsWidth
} from './tree-metrics'

/** The least room between the sibling bars of two families on one row. */
const BAR_CLEARANCE = SIBLING_BLOCK_GAP

/** Each pass widens what overlaps; a family no pass can clear keeps the last one rather than looping. */
const MAX_SPREADING_PASSES = 500

/** The children of one union hanging from their bar, from the parents' anchor to the outermost child. */
type SiblingBar = {
  block: DescendancyBlock
  from: number
  generation: number
  group: PartnerGroup
  to: number
}

type Spreading = {
  extraGapsOf: Map<DescendancyBlock, number[]>
  spaceBeforeOf: Map<DescendancyBlock, number>
}

const childrenOf = (block: DescendancyBlock) =>
  block.groups.flatMap((group) => group.children.map(({ block }) => block))

/**
 * The gap the union line of a group crosses, or for a partner further away,
 * the gap just before them: widening it moves this group's anchor right of
 * every group on its left.
 */
const anchorGapIndex = (block: DescendancyBlock, group: PartnerGroup) =>
  Math.abs(group.partnerSlotIndex - block.selfSlotIndex) === 1
    ? Math.min(group.partnerSlotIndex, block.selfSlotIndex)
    : group.partnerSlotIndex - 1

const placeBlocks = ({
  lineage,
  root,
  spreading: { extraGapsOf, spaceBeforeOf }
}: {
  lineage: FamilyLineage
  root: DescendancyBlock
  spreading: Spreading
}) => {
  const extraGaps = (block: DescendancyBlock): ExtraGaps =>
    extraGapsOf.get(block) ?? []
  const widthOf = (block: DescendancyBlock) =>
    slotsWidth(block.slots.length, extraGaps(block))

  const nodes = tidyTree({
    childrenOf,
    root,
    spaceBefore: (block) => spaceBeforeOf.get(block) ?? 0,
    widthOf
  }).descendants()
  const leftOf = new Map(
    nodes.map((node) => [node.data, node.x - widthOf(node.data) / 2])
  )
  const slotLeftIn = (block: DescendancyBlock, index: number) =>
    slotLeft({
      extraGaps: extraGaps(block),
      index,
      left: leftOf.get(block) ?? 0
    })
  const selfCenterOf = (block: DescendancyBlock) =>
    slotLeftIn(block, block.selfSlotIndex) + CARD_WIDTH / 2

  const cards = nodes.flatMap(({ data: block }) =>
    slotCards({
      blockKey: block.personId,
      extraGaps: extraGaps(block),
      generation: block.generation,
      left: leftOf.get(block) ?? 0,
      lineage,
      slots: block.slots,
      y: rowY(block.generation)
    })
  )

  const bars: SiblingBar[] = []
  const connectors = nodes.flatMap(({ data: block }): TreeConnector[] => {
    const y = rowY(block.generation)

    return block.groups.flatMap((group, stagger) => {
      const { anchor, points } = unionPath({
        areNeighbours:
          Math.abs(group.partnerSlotIndex - block.selfSlotIndex) === 1,
        firstLeft: slotLeftIn(block, block.selfSlotIndex),
        secondLeft: slotLeftIn(block, group.partnerSlotIndex),
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
      const from = Math.min(anchor.x, ...childXs)
      const to = Math.max(anchor.x, ...childXs)
      bars.push({ block, from, generation: block.generation, group, to })
      return [
        union,
        { kind: 'siblings', points: [anchor, { x: anchor.x, y: barY }] },
        {
          kind: 'siblings',
          points: [
            { x: from, y: barY },
            { x: to, y: barY }
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

  return { bars, layout: { cards, connectors } }
}

type CrowdedBars = { left: SiblingBar; missing: number; right: SiblingBar }

/**
 * Two bars of one row close enough for a line of one to run into the
 * other, from the lowest row up and left to right: spreading a row apart
 * never changes the rows below it.
 */
const firstCrowdedBars = (bars: readonly SiblingBar[]): CrowdedBars | null => {
  const ordered = bars.toSorted(
    (left, right) =>
      right.generation - left.generation || left.from - right.from
  )
  for (const [index, left] of ordered.entries()) {
    const right = ordered
      .slice(index + 1)
      .find(
        (candidate) =>
          candidate.generation === left.generation &&
          candidate.from < left.to + BAR_CLEARANCE
      )
    if (right !== undefined) {
      return { left, missing: left.to + BAR_CLEARANCE - right.from, right }
    }
  }
  return null
}

/**
 * Makes room where two families' bars would share a stretch of row: the
 * parents of one couple stand further apart, two separate blocks move apart.
 */
const spreadApart = (
  { extraGapsOf, spaceBeforeOf }: Spreading,
  { left, missing, right }: CrowdedBars
) => {
  if (left.block !== right.block) {
    spaceBeforeOf.set(
      right.block,
      (spaceBeforeOf.get(right.block) ?? 0) + missing
    )
    return
  }
  const gaps = extraGapsOf.get(left.block) ?? []
  const widened = [
    anchorGapIndex(left.block, left.group),
    anchorGapIndex(right.block, right.group)
  ].reduce(
    (current, gapIndex) =>
      Array.from(
        { length: Math.max(current.length, gapIndex + 1) },
        (_, index) =>
          (current[index] ?? 0) + (index === gapIndex ? 2 * missing : 0)
      ),
    gaps
  )
  extraGapsOf.set(left.block, widened)
}

/**
 * `rootId` and their descendants down to `depth` generations, partners
 * beside them. Each union's children hang under its own side, and no two
 * sibling bars share a stretch of row, so no line crosses another.
 */
export const layoutDescendancy = ({
  depth,
  drawnBefore,
  lineage,
  rootId
}: {
  depth: number
  /** People another tree of the same canvas already draws: see `descendancyBlocks`. */
  drawnBefore?: ReadonlySet<EntityId>
  lineage: FamilyLineage
  rootId: EntityId
}): TreeLayout => {
  const root = descendancyBlocks({ depth, drawnBefore, lineage, rootId })
  const spreading: Spreading = {
    extraGapsOf: new Map(),
    spaceBeforeOf: new Map()
  }

  let placed = placeBlocks({ lineage, root, spreading })
  for (let pass = 1; pass < MAX_SPREADING_PASSES; pass += 1) {
    const crowded = firstCrowdedBars(placed.bars)
    if (crowded === null) break
    spreadApart(spreading, crowded)
    placed = placeBlocks({ lineage, root, spreading })
  }
  return placed.layout
}
