import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'

import { requireActivePerson } from '../family/active-person'
import type { FamilyState } from '../family/family-state'
import { type BlockSlot, slotCards } from './block-slots'
import { descentPath, siblingBarY, unionPath } from './connector-paths'
import { type FamilyLineage, familyLineage } from './family-lineage'
import { layoutDescendancy } from './layout-descendancy'
import { tidyTree } from './tidy-tree'
import type { TreeConnector, TreeLayout, TreePoint } from './tree-layout'
import { CARD_WIDTH, rowY, slotLeft, slotsWidth } from './tree-metrics'

/** The parents of one person side by side, above their own parents in turn. */
type ParentCouple = {
  childId: EntityId
  /** The child's filiations to the parents of the couple. */
  filiations: readonly Filiation[]
  generation: number
  parents: readonly ParentCouple[]
  slots: readonly BlockSlot[]
}

const parentCouple = ({
  childId,
  drawn,
  generationsLeft,
  lineage
}: {
  childId: EntityId
  drawn: Set<EntityId>
  generationsLeft: number
  lineage: FamilyLineage
}): ParentCouple | null => {
  const filiations = lineage.parentLinksOf(childId)
  if (generationsLeft === 0 || filiations.length === 0) return null

  const parentIds = [...new Set(filiations.map(({ parentId }) => parentId))]
  const slots = parentIds.map((personId): BlockSlot => {
    const isRepeated = drawn.has(personId)
    drawn.add(personId)
    return { isRepeated, kind: 'person', personId }
  })
  const withUnknownParent: readonly BlockSlot[] =
    slots.length === 1 ? [...slots, { kind: 'unknown-parent' }] : slots

  return {
    childId,
    filiations,
    generation: Math.max(...parentIds.map(lineage.generationOf)),
    parents: slots.flatMap((slot) =>
      slot.kind === 'person' && !slot.isRepeated
        ? (parentCouple({
            childId: slot.personId,
            drawn,
            generationsLeft: generationsLeft - 1,
            lineage
          }) ?? [])
        : []
    ),
    slots: withUnknownParent
  }
}

const unionBetween = (
  lineage: FamilyLineage,
  [first, second]: readonly [BlockSlot, BlockSlot]
) => {
  if (first.kind !== 'person') return null
  const secondId = second.kind === 'person' ? second.personId : null
  return (
    lineage
      .unionsOf(first.personId)
      .find(({ partnerIds }) =>
        secondId === null
          ? partnerIds[1] === null
          : partnerIds.includes(secondId)
      ) ?? null
  )
}

const layoutAncestors = ({
  focusCenter,
  lineage,
  root
}: {
  focusCenter: TreePoint
  lineage: FamilyLineage
  root: ParentCouple
}): TreeLayout => {
  const tree = tidyTree({ childrenOf: ({ parents }) => parents, root })
  const shift = focusCenter.x - tree.x
  const leftOf = (node: typeof tree) =>
    node.x + shift - slotsWidth(node.data.slots.length) / 2

  const nodes = tree.descendants()
  const cards = nodes.flatMap((node) =>
    slotCards({
      blockKey: `parents-of:${node.data.childId}`,
      generation: node.data.generation,
      left: leftOf(node),
      lineage,
      slots: node.data.slots,
      y: rowY(node.data.generation)
    })
  )

  const childTopCenter = (node: typeof tree): TreePoint => {
    if (node.parent === null) return focusCenter
    const index = node.parent.data.slots.findIndex(
      (slot) => slot.kind === 'person' && slot.personId === node.data.childId
    )
    return {
      x: slotLeft({ index, left: leftOf(node.parent) }) + CARD_WIDTH / 2,
      y: rowY(node.parent.data.generation)
    }
  }

  const connectors = nodes.flatMap((node): TreeConnector[] => {
    const left = leftOf(node)
    const y = rowY(node.data.generation)
    const pairs = node.data.slots.flatMap((slot, index) => {
      const next = node.data.slots[index + 1]
      return next === undefined ? [] : [{ index, slots: [slot, next] as const }]
    })
    const unions = pairs.map(({ index, slots }) => ({
      path: unionPath({
        firstLeft: slotLeft({ index, left }),
        secondLeft: slotLeft({ index: index + 1, left }),
        stagger: 0,
        y
      }),
      union: unionBetween(lineage, slots)
    }))
    const [first] = unions
    if (first === undefined) return []

    return [
      ...unions.map(
        ({ path, union }): TreeConnector => ({
          kind: 'union',
          points: path.points,
          union
        })
      ),
      {
        childId: node.data.childId,
        filiations: node.data.filiations,
        kind: 'descent',
        points: descentPath({
          anchor: first.path.anchor,
          barY: siblingBarY({ stagger: 0, y }),
          child: childTopCenter(node)
        })
      }
    ]
  })

  return { cards, connectors }
}

/**
 * An hourglass around one person: their ancestors above, `generationsUp`
 * deep, and their descendants below, `generationsDown` deep, partners beside
 * everyone of their line.
 */
export const layoutAroundPerson = (
  family: FamilyState,
  {
    focusId,
    generationsDown,
    generationsUp
  }: { focusId: EntityId; generationsDown: number; generationsUp: number }
): Result<TreeLayout, 'person_binned' | 'person_not_found'> => {
  const focus = requireActivePerson(family, focusId)
  if (focus.status === 'failure') return focus

  const lineage = familyLineage(family)
  const below = layoutDescendancy({
    depth: generationsDown,
    lineage,
    rootId: focusId
  })
  const focusCard = below.cards.find(
    (card) => card.kind === 'person' && card.personId === focusId
  )
  const drawn = new Set(
    below.cards.flatMap((card) => (card.kind === 'person' ? card.personId : []))
  )
  const parents = parentCouple({
    childId: focusId,
    drawn,
    generationsLeft: generationsUp,
    lineage
  })
  if (parents === null || focusCard === undefined) return Result.success(below)

  const above = layoutAncestors({
    focusCenter: { x: focusCard.x + CARD_WIDTH / 2, y: focusCard.y },
    lineage,
    root: parents
  })
  return Result.success({
    cards: [...above.cards, ...below.cards],
    connectors: [...above.connectors, ...below.connectors]
  })
}
