import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyLineage } from '../tree-layout/family-lineage'
import { wholeFamilyRoot } from '../tree-layout/layout-whole-family'

/** Who the visitor chose not to see, and who leaves the tree with them. */
export type HiddenPeople = {
  /** The person the tree hangs from: whoever is still tied to them is shown. `null` once everyone is hidden. */
  anchorId: EntityId | null
  /** Hidden without being unticked: they hang on the tree only through someone who was. */
  carriedIds: ReadonlySet<EntityId>
  /** Everyone hidden: the unticked and the carried. */
  hiddenIds: ReadonlySet<EntityId>
  /** Unticked by hand, the only ones worth remembering. */
  uncheckedIds: ReadonlySet<EntityId>
}

/** What one tick changed, for the sentence that tells it. */
export type ShownChange =
  | {
      /** Who left the tree with them. */
      carriedIds: readonly EntityId[]
      kind: 'hidden'
      personId: EntityId
    }
  | {
      /** The unticked people they came back through: their link with the tree. */
      linkIds: readonly EntityId[]
      kind: 'shown'
      personId: EntityId
      /** Who came back with them, besides their link. */
      withIds: readonly EntityId[]
    }

type Neighbours = (personId: EntityId) => readonly EntityId[]

/** Parents, children and partners: a hidden person cuts every one of these ties. */
const neighboursIn = (lineage: FamilyLineage): Neighbours => {
  const tied = new Map(
    lineage.personIds.map((personId) => [
      personId,
      [
        ...new Set([
          ...lineage.parentLinksOf(personId).map(({ parentId }) => parentId),
          ...lineage.childLinksOf(personId).map(({ childId }) => childId),
          ...lineage
            .unionsOf(personId)
            .flatMap(({ partnerIds }) => partnerIds)
            .filter(
              (partnerId): partnerId is EntityId =>
                partnerId !== null && partnerId !== personId
            )
        ])
      ]
    ])
  )
  return (personId) => tied.get(personId) ?? []
}

/** Everyone reached from `start` without stepping on a blocked person. */
const reachedFrom = (
  start: EntityId,
  neighbours: Neighbours,
  isBlocked: (personId: EntityId) => boolean
): Set<EntityId> => {
  const reached = new Set([start])
  const queue = [start]
  for (
    let personId = queue.shift();
    personId !== undefined;
    personId = queue.shift()
  ) {
    for (const next of neighbours(personId)) {
      if (reached.has(next) || isBlocked(next)) continue
      reached.add(next)
      queue.push(next)
    }
  }
  return reached
}

/** The top of the whole family, or the first person recorded when nobody tops it. */
const rootOf = (lineage: FamilyLineage): EntityId | null =>
  wholeFamilyRoot(lineage) ?? lineage.personIds[0] ?? null

/** The root while it is shown; once it is unticked, someone in the largest group left of its family. */
const anchorOf = ({
  family,
  neighbours,
  root,
  uncheckedIds
}: {
  family: ReadonlySet<EntityId>
  neighbours: Neighbours
  root: EntityId
  uncheckedIds: ReadonlySet<EntityId>
}): EntityId | null => {
  if (!uncheckedIds.has(root)) return root

  const grouped = new Set<EntityId>()
  let largest: Set<EntityId> = new Set()
  for (const personId of family) {
    if (grouped.has(personId) || uncheckedIds.has(personId)) continue
    const group = reachedFrom(personId, neighbours, (id) =>
      uncheckedIds.has(id)
    )
    for (const member of group) grouped.add(member)
    if (group.size > largest.size) largest = group
  }
  const [anchorId] = largest
  return anchorId ?? null
}

/**
 * Who is hidden when `uncheckedIds` are unticked: them, and whoever was tied
 * to the top of the family only through them. Someone tied to nobody stays
 * shown unless unticked themselves.
 */
export const hiddenPeople = (
  lineage: FamilyLineage,
  uncheckedIds: Iterable<EntityId>
): HiddenPeople => {
  const inTree = new Set(lineage.personIds)
  const unchecked = new Set([...uncheckedIds].filter((id) => inTree.has(id)))
  const root = rootOf(lineage)
  if (root === null) {
    return {
      anchorId: null,
      carriedIds: new Set(),
      hiddenIds: unchecked,
      uncheckedIds: unchecked
    }
  }

  const neighbours = neighboursIn(lineage)
  const family = reachedFrom(root, neighbours, () => false)
  const anchorId = anchorOf({
    family,
    neighbours,
    root,
    uncheckedIds: unchecked
  })
  const shown =
    anchorId === null
      ? new Set<EntityId>()
      : reachedFrom(anchorId, neighbours, (id) => unchecked.has(id))
  const carriedIds = new Set(
    [...family].filter((id) => !shown.has(id) && !unchecked.has(id))
  )

  return {
    anchorId,
    carriedIds,
    hiddenIds: new Set([...unchecked, ...carriedIds]),
    uncheckedIds: unchecked
  }
}

/**
 * The unticked people on the shortest way from the anchor to a carried
 * person, counted in unticked people crossed: ticking them back brings that
 * person back by the fewest changes.
 */
export const linkBackOf = (
  lineage: FamilyLineage,
  { anchorId, uncheckedIds }: HiddenPeople,
  personId: EntityId
): EntityId[] => {
  const start = anchorId ?? rootOf(lineage)
  if (start === null) return []

  const neighbours = neighboursIn(lineage)
  const costOf = (id: EntityId) => (uncheckedIds.has(id) ? 1 : 0)
  const cost = new Map([[start, costOf(start)]])
  const cameFrom = new Map<EntityId, EntityId>()
  const frontier = [start]
  for (
    let current = frontier.shift();
    current !== undefined;
    current = frontier.shift()
  ) {
    const reachedCost = cost.get(current) ?? 0
    for (const next of neighbours(current)) {
      const step = reachedCost + costOf(next)
      if ((cost.get(next) ?? Number.POSITIVE_INFINITY) <= step) continue
      cost.set(next, step)
      cameFrom.set(next, current)
      if (costOf(next) === 0) frontier.unshift(next)
      else frontier.push(next)
    }
  }

  const path: EntityId[] = []
  for (
    let at: EntityId | undefined = personId;
    at !== undefined;
    at = cameFrom.get(at)
  ) {
    path.push(at)
  }
  return path.filter((id) => uncheckedIds.has(id)).toReversed()
}

/** Who is in `from` and no longer in `still`, `besides` apart. */
const leftOut = (
  from: ReadonlySet<EntityId>,
  still: ReadonlySet<EntityId>,
  besides: readonly EntityId[]
): EntityId[] =>
  [...from].filter((id) => !still.has(id) && !besides.includes(id))

/**
 * Ticks or unticks one person. A shown person is unticked; an unticked one is
 * ticked back; a carried one comes back with the unticked people on their way
 * to the anchor.
 */
export const toggleShown = (
  lineage: FamilyLineage,
  before: HiddenPeople,
  personId: EntityId
): { after: HiddenPeople; change: ShownChange } => {
  if (!before.hiddenIds.has(personId)) {
    const after = hiddenPeople(lineage, [...before.uncheckedIds, personId])
    return {
      after,
      change: {
        carriedIds: leftOut(after.carriedIds, before.hiddenIds, []),
        kind: 'hidden',
        personId
      }
    }
  }

  const linkIds = before.uncheckedIds.has(personId)
    ? []
    : linkBackOf(lineage, before, personId)
  const tickedBackIds = [personId, ...linkIds]
  const after = hiddenPeople(
    lineage,
    [...before.uncheckedIds].filter((id) => !tickedBackIds.includes(id))
  )
  return {
    after,
    change: {
      kind: 'shown',
      linkIds,
      personId,
      withIds: leftOut(before.hiddenIds, after.hiddenIds, tickedBackIds)
    }
  }
}
