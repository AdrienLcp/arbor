import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '../family/family-state'
import { type FamilyLineage, familyLineage } from './family-lineage'
import { layoutDescendancy } from './layout-descendancy'
import { EMPTY_TREE_LAYOUT, type TreeLayout } from './tree-layout'
import { CARD_WIDTH, FAMILIES_GAP } from './tree-metrics'

const descendantsOf = (lineage: FamilyLineage, personId: EntityId) => {
  const reached = new Set<EntityId>()
  const toVisit = [personId]
  for (
    let current = toVisit.pop();
    current !== undefined;
    current = toVisit.pop()
  ) {
    for (const { childId } of lineage.childLinksOf(current)) {
      if (reached.has(childId)) continue
      reached.add(childId)
      toVisit.push(childId)
    }
  }
  return reached
}

const isTied = (lineage: FamilyLineage, personId: EntityId) =>
  lineage.parentLinksOf(personId).length > 0 ||
  lineage.childLinksOf(personId).length > 0 ||
  lineage.unionsOf(personId).length > 0

/** The founder whose descendancy draws the most people not drawn yet, someone tied to others before someone alone. */
const widestFounder = (
  lineage: FamilyLineage,
  drawn: ReadonlySet<EntityId>
): EntityId | null => {
  const founders = lineage.personIds
    .filter((personId) => lineage.parentLinksOf(personId).length === 0)
    .map((personId) => ({
      count: [personId, ...descendantsOf(lineage, personId)].filter(
        (id) => !drawn.has(id)
      ).length,
      isTied: isTied(lineage, personId),
      personId
    }))
    .filter(({ count }) => count > 0)
  const [widest] = founders.toSorted(
    (left, right) =>
      right.count - left.count || Number(right.isTied) - Number(left.isTied)
  )
  return widest?.personId ?? null
}

/** Whoever has no known parent and the most descendants: the top of the keeper's paper tree. */
export const wholeFamilyRoot = (lineage: FamilyLineage): EntityId | null =>
  widestFounder(lineage, new Set())

const personIdsDrawnIn = ({ cards }: TreeLayout) =>
  cards.flatMap((card) =>
    card.kind === 'person' && !card.isRepeated ? card.personId : []
  )

const shiftedRight = (layout: TreeLayout, distance: number): TreeLayout => ({
  cards: layout.cards.map((card) => ({ ...card, x: card.x + distance })),
  connectors: layout.connectors.map((connector) => ({
    ...connector,
    points: connector.points.map(({ x, y }) => ({ x: x + distance, y }))
  }))
})

const leftEdge = ({ cards }: TreeLayout) => Math.min(...cards.map(({ x }) => x))
const rightEdge = ({ cards }: TreeLayout) =>
  Math.max(...cards.map(({ x }) => x + CARD_WIDTH))

/**
 * Everyone tied to someone in the family: the descendancy of its widest
 * founder, then, side by side on the same generation rows, the family of
 * each person who married in, from that family's own founder. The one who
 * married in appears twice: in their partner's family, and as a repeat under
 * their own parents. People tied to no one wait beside the tree instead.
 */
export const layoutWholeFamily = (family: FamilyState): TreeLayout => {
  const lineage = familyLineage(family)
  const rootId = wholeFamilyRoot(lineage)
  if (rootId === null) return EMPTY_TREE_LAYOUT

  const main = layoutDescendancy({
    depth: Number.POSITIVE_INFINITY,
    lineage,
    rootId
  })
  const drawn = new Set(personIdsDrawnIn(main))
  const tiedLineage: FamilyLineage = {
    ...lineage,
    personIds: lineage.personIds.filter((id) => isTied(lineage, id))
  }

  let canvas = main
  for (
    let founderId = widestFounder(tiedLineage, drawn);
    founderId !== null;
    founderId = widestFounder(tiedLineage, drawn)
  ) {
    const tree = layoutDescendancy({
      depth: Number.POSITIVE_INFINITY,
      drawnBefore: drawn,
      lineage,
      rootId: founderId
    })
    const newcomers = personIdsDrawnIn(tree)
    if (newcomers.length === 0) break
    for (const personId of newcomers) drawn.add(personId)

    const placed = shiftedRight(
      tree,
      rightEdge(canvas) + FAMILIES_GAP - leftEdge(tree)
    )
    canvas = {
      cards: [...canvas.cards, ...placed.cards],
      connectors: [...canvas.connectors, ...placed.connectors]
    }
  }
  return canvas
}
