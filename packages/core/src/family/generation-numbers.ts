import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

/** The oldest generation: whoever has no known parent. */
export const FIRST_GENERATION = 1

type Lineage = {
  filiations: Iterable<Filiation>
  personIds: Iterable<EntityId>
  unions: Iterable<Union>
}

/**
 * Each person's generation, counted from the oldest: a child is one below
 * its lowest parent, and partners share the lower of their two generations.
 * Partners married across generations would push each other down forever,
 * so the count stops once no generation can be deeper than the family is large.
 */
export const generationNumbers = ({
  filiations,
  personIds,
  unions
}: Lineage): ReadonlyMap<EntityId, number> => {
  const generations = new Map<EntityId, number>()
  for (const personId of personIds) generations.set(personId, FIRST_GENERATION)

  const links = [...filiations]
  const couples = [...unions].map(({ partnerIds }) => partnerIds)
  const deepestPossible = generations.size

  const pushDown = (personId: EntityId, atLeast: number): boolean => {
    const current = generations.get(personId)
    if (
      current === undefined ||
      current >= atLeast ||
      atLeast > deepestPossible
    ) {
      return false
    }
    generations.set(personId, atLeast)
    return true
  }

  for (let hasMoved = true; hasMoved; ) {
    hasMoved = false

    for (const { childId, parentId } of links) {
      const parent = generations.get(parentId)
      if (parent !== undefined && pushDown(childId, parent + 1)) hasMoved = true
    }

    for (const [first, second] of couples) {
      if (second === null) continue
      const lower = Math.max(
        generations.get(first) ?? FIRST_GENERATION,
        generations.get(second) ?? FIRST_GENERATION
      )
      if (pushDown(first, lower)) hasMoved = true
      if (pushDown(second, lower)) hasMoved = true
    }
  }

  return generations
}
