import { describe, expect, it } from 'vitest'

import type { Person } from '@arbor/protocol/person'

import { personUpdate } from './person-update'

const louis: Person = {
  birth: {
    date: { point: { precision: 'year', year: 1905 }, qualifier: 'exact' },
    place: 'Douarnenez'
  },
  birthSurname: null,
  death: null,
  givenNames: 'Louis',
  id: 'louis',
  livingOverride: null,
  notes: '',
  portraitPhotoId: null,
  sex: 'male',
  surname: 'Morel'
}

describe('personUpdate', () => {
  it('carries only the fields that changed, before and after', () => {
    expect(
      personUpdate(louis, {
        birth: {
          date: {
            point: { precision: 'year', year: 1906 },
            qualifier: 'about'
          },
          place: 'Douarnenez'
        },
        givenNames: 'Louis',
        surname: 'Morel'
      })
    ).toEqual({
      after: {
        birth: {
          date: {
            point: { precision: 'year', year: 1906 },
            qualifier: 'about'
          },
          place: 'Douarnenez'
        }
      },
      before: { birth: louis.birth },
      personId: 'louis',
      type: 'person.update'
    })
  })

  it('sees no change in the same occurrence written in another key order', () => {
    const placeFirst = {
      ...{ place: 'Douarnenez' },
      date: louis.birth?.date ?? null
    }
    expect(Object.keys(placeFirst)).toEqual(['place', 'date'])
    expect(personUpdate(louis, { birth: placeFirst })).toBeNull()
  })

  it('records clearing a field', () => {
    expect(personUpdate(louis, { birth: null })).toMatchObject({
      after: { birth: null },
      before: { birth: louis.birth }
    })
  })
})
