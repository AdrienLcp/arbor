import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation, FiliationKind } from '@arbor/protocol/filiation'
import type { Person } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import { EMPTY_FAMILY, type FamilyState } from '../family/family-state'

const GIVEN_NAMES = {
  female: ['Anne', 'Rose', 'Lise', 'Jade', 'Emma', 'Léa', 'Zoé', 'Inès'],
  male: ['Jean', 'Paul', 'Luc', 'Marc', 'Yves', 'Hugo', 'Léo', 'Noé']
} as const
const SURNAMES = ['Morel', 'Roux', 'Petit', 'Blanc', 'Faure', 'Girard']
const UNION_KINDS = ['marriage', 'marriage', 'partnership', 'pacs'] as const

/** Surname of the parents of someone who married in: the whole-family view leaves them out. */
export const MARRIED_IN_PARENTS_SURNAME = 'Belle-famille'

type Sex = keyof typeof GIVEN_NAMES

/**
 * A deterministic family of about `size` people over eight generations, with
 * the shapes a real one has: remarriages, half-siblings, adoptions, unknown
 * other parents, step-children, and married-in spouses with parents of their own.
 */
export const generatedFamily = (size: number): FamilyState => {
  let seed = 42
  const random = () => {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648
    return seed / 2_147_483_648
  }
  const pick = <Item>(items: readonly Item[]): Item => {
    const item = items[Math.floor(random() * items.length)]
    if (item === undefined) throw new Error('Nothing to pick from')
    return item
  }
  const otherSex = (sex: Sex): Sex => (sex === 'male' ? 'female' : 'male')
  const randomSex = (): Sex => (random() < 0.5 ? 'male' : 'female')

  const persons = new Map<EntityId, Person>()
  const unions = new Map<EntityId, Union>()
  const filiations = new Map<EntityId, Filiation>()
  const sexes = new Map<EntityId, Sex>()

  const person = (sex: Sex, surname: string) => {
    const id = `p${persons.size}`
    persons.set(id, {
      birth: null,
      birthSurname: null,
      death: null,
      givenNames: pick(GIVEN_NAMES[sex]),
      id,
      livingOverride: null,
      notes: '',
      portraitPhotoId: null,
      sex,
      surname
    })
    sexes.set(id, sex)
    return id
  }
  const link = (
    parentId: EntityId,
    childId: EntityId,
    kind: FiliationKind = 'birth'
  ) => {
    const id = `${parentId}--${childId}`
    filiations.set(id, { childId, id, kind, parentId })
  }
  const unite = (first: EntityId, second: EntityId) => {
    const id = `u${unions.size}`
    const union: Union = {
      end: null,
      id,
      kind: pick(UNION_KINDS),
      partnerIds: [first, second],
      start: null
    }
    unions.set(id, union)
    return union
  }
  const isFull = () => persons.size >= size

  const founder = person('male', 'Morel')
  const founderPartner = person('female', 'Roux')
  unite(founder, founderPartner)
  let line: { id: EntityId; partner: EntityId | null }[] = [
    { id: founder, partner: founderPartner }
  ]

  for (let generation = 2; generation <= 8 && !isFull(); generation++) {
    const children: EntityId[] = []
    for (const { id, partner } of line) {
      if (isFull()) break
      if (partner === null) {
        const child = person(randomSex(), 'Morel')
        link(id, child)
        children.push(child)
        continue
      }
      const partners = [partner]
      if (random() < 0.18) {
        const [firstUnion] = [...unions.values()].filter(({ partnerIds }) =>
          partnerIds.includes(id)
        )
        const secondPartner = person(
          otherSex(sexes.get(id) ?? 'male'),
          pick(SURNAMES)
        )
        unite(id, secondPartner)
        if (firstUnion !== undefined && random() < 0.7) {
          unions.set(firstUnion.id, {
            ...firstUnion,
            end: { date: null, kind: 'divorce', place: null }
          })
        }
        partners.push(secondPartner)
      }
      for (const coParent of partners) {
        const count = 1 + Math.floor(random() * (generation >= 4 ? 2 : 3))
        for (let index = 0; index < count && !isFull(); index++) {
          const child = person(randomSex(), 'Morel')
          const kind = random() < 0.06 ? 'adoption' : 'birth'
          link(id, child, kind)
          link(coParent, child, kind)
          children.push(child)
        }
      }
    }

    line = children.map((id) => {
      if (isFull() || random() < 0.12) return { id, partner: null }
      const spouse = person(otherSex(sexes.get(id) ?? 'male'), pick(SURNAMES))
      if (random() < 0.2 && persons.size + 2 < size) {
        const father = person('male', MARRIED_IN_PARENTS_SURNAME)
        const mother = person('female', MARRIED_IN_PARENTS_SURNAME)
        unite(father, mother)
        link(father, spouse)
        link(mother, spouse)
      }
      if (random() < 0.08 && !isFull()) {
        const stepChild = person('male', pick(SURNAMES))
        link(spouse, stepChild)
        link(id, stepChild, 'step')
      }
      unite(id, spouse)
      return { id, partner: spouse }
    })
  }

  return { ...EMPTY_FAMILY, filiations, persons, unions }
}
