import type { FamilySnapshot } from '@arbor/protocol/family'
import type { Person } from '@arbor/protocol/person'

import { generationNumbers } from '@arbor/core/family/generation-numbers'
import { isLiving } from '@arbor/core/family/is-living'

/** A person as a list shows them: with their generation, which picks their ink, and whether they are still living. */
export type ListedPerson = {
  generation: number
  isLiving: boolean
  person: Person
}

/** Names are French data: they sort the French way whatever language the interface speaks. */
const FRENCH_NAMES = new Intl.Collator('fr', { sensitivity: 'base' })

const byName = (first: ListedPerson, second: ListedPerson): number =>
  FRENCH_NAMES.compare(first.person.surname, second.person.surname) ||
  FRENCH_NAMES.compare(first.person.givenNames, second.person.givenNames)

const byGenerationThenName = (
  first: ListedPerson,
  second: ListedPerson
): number => first.generation - second.generation || byName(first, second)

/** Everyone in the family who is not in the bin, oldest generation first, by name within it. */
export const listedPeople = (
  family: FamilySnapshot,
  today: Temporal.PlainDate
): ListedPerson[] => {
  const binned = new Set(family.binnedPersonIds)
  const people = family.persons.filter(({ id }) => !binned.has(id))
  const generations = generationNumbers({
    filiations: family.filiations,
    personIds: people.map(({ id }) => id),
    unions: family.unions
  })

  return people
    .map((person) => ({
      generation: generations.get(person.id) ?? 1,
      isLiving: isLiving(person, today),
      person
    }))
    .toSorted(byGenerationThenName)
}

/** Everyone in the bin, by name, each with the generation they hold in the tree once taken out. */
export const binnedPeople = (
  family: FamilySnapshot,
  today: Temporal.PlainDate
): ListedPerson[] => {
  const binned = new Set(family.binnedPersonIds)
  const generations = generationNumbers({
    filiations: family.filiations,
    personIds: family.persons.map(({ id }) => id),
    unions: family.unions
  })

  return family.persons
    .filter(({ id }) => binned.has(id))
    .map((person) => ({
      generation: generations.get(person.id) ?? 1,
      isLiving: isLiving(person, today),
      person
    }))
    .toSorted(byName)
}
