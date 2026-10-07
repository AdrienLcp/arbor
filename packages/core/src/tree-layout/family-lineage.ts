import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Person } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import type { FamilyState } from '../family/family-state'
import {
  FIRST_GENERATION,
  generationNumbers
} from '../family/generation-numbers'
import { byEarliestPlausibleDay } from '../fuzzy-date/earliest-plausible-day'

/** The people out of the bin and the links between them, indexed for drawing. */
export type FamilyLineage = {
  /** Links to a person's children, eldest first; a child with no known birth comes after. */
  childLinksOf: (personId: EntityId) => readonly Filiation[]
  generationOf: (personId: EntityId) => number
  parentLinksOf: (personId: EntityId) => readonly Filiation[]
  personIds: readonly EntityId[]
  /** In the order they were recorded: the first partner first. */
  unionsOf: (personId: EntityId) => readonly Union[]
}

const byChildBirth =
  (persons: ReadonlyMap<EntityId, Person>) =>
  (left: Filiation, right: Filiation) => {
    const leftBirth = persons.get(left.childId)?.birth?.date ?? null
    const rightBirth = persons.get(right.childId)?.birth?.date ?? null
    if (leftBirth === null) return rightBirth === null ? 0 : 1
    if (rightBirth === null) return -1
    return byEarliestPlausibleDay(leftBirth, rightBirth)
  }

export const familyLineage = (family: FamilyState): FamilyLineage => {
  const isActive = (personId: EntityId) =>
    family.persons.has(personId) && !family.binnedPersonIds.has(personId)

  const personIds = [...family.persons.keys()].filter(isActive)
  const filiations = [...family.filiations.values()]
    .filter(({ childId, parentId }) => isActive(childId) && isActive(parentId))
    .toSorted(byChildBirth(family.persons))
  const unions = [...family.unions.values()].filter(
    ({ partnerIds: [first, second] }) =>
      isActive(first) && (second === null || isActive(second))
  )

  const childLinks = Map.groupBy(filiations, ({ parentId }) => parentId)
  const parentLinks = Map.groupBy(filiations, ({ childId }) => childId)
  const unionsByPerson = Map.groupBy(
    unions.flatMap((union) =>
      union.partnerIds
        .filter((partnerId) => partnerId !== null)
        .map((partnerId) => ({ partnerId, union }))
    ),
    ({ partnerId }) => partnerId
  )
  const generations = generationNumbers({ filiations, personIds, unions })

  return {
    childLinksOf: (personId) => childLinks.get(personId) ?? [],
    generationOf: (personId) => generations.get(personId) ?? FIRST_GENERATION,
    parentLinksOf: (personId) => parentLinks.get(personId) ?? [],
    personIds,
    unionsOf: (personId) =>
      (unionsByPerson.get(personId) ?? []).map(({ union }) => union)
  }
}
