import { describe, expect, it } from 'vitest'

import type { FamilySnapshot } from '@arbor/protocol/family'
import type { Person } from '@arbor/protocol/person'

import { listedPeople } from './family-people'

const TODAY = Temporal.PlainDate.from('2026-10-07')

const person = (
  id: string,
  givenNames: string,
  surname: string,
  death: Person['death'] = null
): Person => ({
  birth: null,
  birthSurname: null,
  death,
  givenNames,
  id,
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'unknown',
  surname
})

const EMPTY_FAMILY: FamilySnapshot = {
  binnedPersonIds: [],
  events: [],
  filiations: [],
  persons: [],
  photos: [],
  unions: []
}

const family: FamilySnapshot = {
  ...EMPTY_FAMILY,
  binnedPersonIds: ['binned-person-0001'],
  filiations: [
    {
      childId: 'child-person-00001',
      id: 'filiation-0000001',
      kind: 'birth',
      parentId: 'parent-person-0001'
    }
  ],
  persons: [
    person('child-person-00001', 'Léa', 'Morel'),
    person('parent-person-0001', 'Pierre', 'Morel', {
      date: null,
      place: null
    }),
    person('binned-person-0001', 'Paul', 'Morel'),
    person('other-person-00001', 'Émile', 'Durand')
  ]
}

describe('family people', () => {
  it('[family-people] lists the oldest generation first, by surname then given name, without the bin', () => {
    expect(
      listedPeople(family, TODAY).map(({ generation, person }) => [
        generation,
        person.givenNames
      ])
    ).toEqual([
      [1, 'Émile'],
      [1, 'Pierre'],
      [2, 'Léa']
    ])
  })

  it('[family-people] tells a person with a recorded death from the living', () => {
    const pierre = listedPeople(family, TODAY).find(
      ({ person }) => person.givenNames === 'Pierre'
    )

    expect(pierre?.isLiving).toBe(false)
  })
})
