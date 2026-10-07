import { describe, expect, it } from 'vitest'

import type { Person } from '@arbor/protocol/person'

import { isLiving } from './is-living'

const TODAY = Temporal.PlainDate.from('2026-10-07')

const person = (fields: Partial<Person>): Person => ({
  birth: null,
  birthSurname: null,
  death: null,
  givenNames: 'Jeanne',
  id: 'jeanne',
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'female',
  surname: 'Morel',
  ...fields
})

const bornIn = (year: number): Partial<Person> => ({
  birth: {
    date: { point: { precision: 'year', year }, qualifier: 'exact' },
    place: null
  }
})

describe('[living] who counts as living', () => {
  it('[living] presumes living without a death, up to 110 years old', () => {
    expect(isLiving(person(bornIn(1950)), TODAY)).toBe(true)
    expect(isLiving(person(bornIn(1917)), TODAY)).toBe(true)
    expect(isLiving(person(bornIn(1915)), TODAY)).toBe(false)
  })

  it('[living] presumes living when nothing is known', () => {
    expect(isLiving(person({}), TODAY)).toBe(true)
  })

  it('[living] treats a death with no details as a death', () => {
    expect(
      isLiving(
        person({ ...bornIn(1990), death: { date: null, place: null } }),
        TODAY
      )
    ).toBe(false)
  })

  it('[living] lets the family override the dates', () => {
    expect(
      isLiving(person({ ...bornIn(1900), livingOverride: true }), TODAY)
    ).toBe(true)
    expect(
      isLiving(person({ ...bornIn(1990), livingOverride: false }), TODAY)
    ).toBe(false)
  })
})
