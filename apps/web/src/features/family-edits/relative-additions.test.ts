import { describe, expect, it } from 'vitest'

import { applyInOrder } from '@arbor/core/family/apply-operation'
import { EMPTY_FAMILY } from '@arbor/core/family/family-state'

import {
  childAddition,
  type NewRelative,
  parentAddition,
  partnerAddition,
  siblingAddition,
  unplacedAddition
} from './relative-additions'

const counter = () => {
  let next = 0
  return () => {
    next += 1
    return `new-${next}`
  }
}

const relative = (givenNames: string): NewRelative => ({
  birth: null,
  givenNames,
  sex: 'unknown',
  surname: 'Morel'
})

const person = (id: string) => ({
  person: {
    ...relative(id),
    birthSurname: null,
    death: null,
    id,
    livingOverride: null,
    notes: '',
    portraitPhotoId: null
  },
  type: 'person.create' as const
})

const partnerIds: [string, string] = ['pierre', 'claire']

const couple = [
  person('pierre'),
  person('claire'),
  {
    type: 'union.create' as const,
    union: {
      end: null,
      id: 'union',
      kind: 'marriage' as const,
      partnerIds,
      start: null
    }
  }
]

describe('childAddition', () => {
  it('ties a child to both partners of the chosen union', () => {
    const operations = childAddition({
      child: relative('Anne'),
      kind: 'birth',
      newId: counter(),
      otherParentId: 'claire',
      parentId: 'pierre'
    })
    const family = applyInOrder(EMPTY_FAMILY, [...couple, ...operations])

    expect(family.status).toBe('success')
    expect(
      family.status === 'success' &&
        [...family.data.filiations.values()].map(({ kind, parentId }) => [
          parentId,
          kind
        ])
    ).toEqual([
      ['pierre', 'birth'],
      ['claire', 'birth']
    ])
  })

  it('makes a raised child the other parent’s by birth', () => {
    const operations = childAddition({
      child: relative('Thomas'),
      kind: 'step',
      newId: counter(),
      otherParentId: 'claire',
      parentId: 'pierre'
    })

    expect(
      operations.flatMap((operation) =>
        operation.type === 'filiation.create'
          ? [[operation.filiation.parentId, operation.filiation.kind]]
          : []
      )
    ).toEqual([
      ['pierre', 'step'],
      ['claire', 'birth']
    ])
  })

  it('leaves a single parent’s child with one link', () => {
    expect(
      childAddition({
        child: relative('Anne'),
        kind: 'birth',
        newId: counter(),
        otherParentId: null,
        parentId: 'pierre'
      })
    ).toHaveLength(2)
  })
})

describe('the other additions', () => {
  it('records a parent, a partner and a sibling the family accepts', () => {
    const newId = counter()
    const anne = person('anne')
    const parents = childAddition({
      child: relative('Anne'),
      kind: 'birth',
      newId,
      otherParentId: 'claire',
      parentId: 'pierre'
    })
    const parentLinks = parents.flatMap((operation) =>
      operation.type === 'filiation.create' ? [operation.filiation] : []
    )
    const operations = [
      ...couple,
      anne,
      ...parents,
      ...parentAddition({
        childId: 'pierre',
        kind: 'adoption',
        newId,
        parent: relative('Louis')
      }),
      ...partnerAddition({
        kind: 'pacs',
        newId,
        partner: relative('Odile'),
        personId: 'pierre',
        start: null
      }),
      ...siblingAddition({
        newId,
        parentFiliations: parentLinks,
        personId: anne.person.id,
        sibling: relative('Simone')
      })
    ]

    const family = applyInOrder(EMPTY_FAMILY, operations)
    expect(family.status).toBe('success')
    expect(family.status === 'success' && family.data.persons.size).toBe(7)
  })
})

describe('siblingAddition', () => {
  it('gives a person with no parent in the tree a brother through an unknown parent they share', () => {
    const newId = counter()
    const operations = [
      person('claire'),
      ...siblingAddition({
        newId,
        parentFiliations: [],
        personId: 'claire',
        sibling: relative('Henri')
      })
    ]

    const family = applyInOrder(EMPTY_FAMILY, operations)
    if (family.status !== 'success') throw new Error('refused')
    const unknownParent = [...family.data.persons.values()].find(
      ({ givenNames }) => givenNames === ''
    )
    const childrenOfUnknown = [...family.data.filiations.values()]
      .filter(({ parentId }) => parentId === unknownParent?.id)
      .map(({ childId }) => family.data.persons.get(childId)?.givenNames)
    expect(childrenOfUnknown.toSorted()).toEqual(['Henri', 'claire'])
  })
})

describe('unplacedAddition', () => {
  it('adds someone tied to no one', () => {
    const family = applyInOrder(
      EMPTY_FAMILY,
      unplacedAddition({ newId: counter(), person: relative('Odette') })
    )
    if (family.status !== 'success') throw new Error('refused')
    expect(family.data.persons.size).toBe(1)
    expect(family.data.filiations.size + family.data.unions.size).toBe(0)
  })
})
