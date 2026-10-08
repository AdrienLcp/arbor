import { describe, expect, it } from 'vitest'

import type { Person } from '@arbor/protocol/person'

import { EMPTY_FAMILY, type FamilyState } from '@arbor/core/family/family-state'

import { binConsequences } from './bin-consequences'

const person = (id: string): [string, Person] => [
  id,
  {
    birth: null,
    birthSurname: null,
    death: null,
    givenNames: id,
    id,
    livingOverride: null,
    notes: '',
    portraitPhotoId: null,
    sex: 'unknown',
    surname: 'Morel'
  }
]

const family: FamilyState = {
  ...EMPTY_FAMILY,
  binnedPersonIds: new Set(['ghost']),
  filiations: new Map([
    ['f1', { childId: 'louis', id: 'f1', kind: 'birth', parentId: 'auguste' }],
    ['f2', { childId: 'anne', id: 'f2', kind: 'birth', parentId: 'louis' }],
    ['f3', { childId: 'ghost', id: 'f3', kind: 'birth', parentId: 'louis' }]
  ]),
  persons: new Map(['auguste', 'louis', 'jeanne', 'anne', 'ghost'].map(person)),
  photos: new Map([
    ['p1', { caption: '', date: null, id: 'p1', personId: 'louis' }],
    ['p2', { caption: '', date: null, id: 'p2', personId: 'anne' }]
  ]),
  unions: new Map([
    [
      'u1',
      {
        end: null,
        id: 'u1',
        kind: 'marriage',
        partnerIds: ['jeanne', 'louis'],
        start: null
      }
    ],
    [
      'u2',
      {
        end: null,
        id: 'u2',
        kind: 'unknown',
        partnerIds: ['louis', null],
        start: null
      }
    ]
  ])
}

describe('binConsequences', () => {
  it('names the links that leave with the person, not the people at their other end', () => {
    expect(binConsequences(family, 'louis')).toEqual({
      childIds: ['anne'],
      parentIds: ['auguste'],
      partnerIds: ['jeanne'],
      photoCount: 1
    })
  })
})
