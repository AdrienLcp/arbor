import { describe, expect, it } from 'vitest'

import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import { generationNumbers } from './generation-numbers'

const childOf = (childId: string, parentId: string): Filiation => ({
  childId,
  id: `${parentId}>${childId}`,
  kind: 'birth',
  parentId
})

const couple = (first: string, second: string | null): Union => ({
  end: null,
  id: `${first}+${second}`,
  kind: 'marriage',
  partnerIds: [first, second],
  start: null
})

describe('[generations] numbering a family from the oldest', () => {
  it('[generations] counts a child one below its parent', () => {
    const generations = generationNumbers({
      filiations: [childOf('paul', 'louis'), childOf('lea', 'paul')],
      personIds: ['louis', 'paul', 'lea'],
      unions: []
    })

    expect(Object.fromEntries(generations)).toEqual({
      lea: 3,
      louis: 1,
      paul: 2
    })
  })

  it('[generations] places someone who married in beside their partner', () => {
    const generations = generationNumbers({
      filiations: [childOf('paul', 'louis'), childOf('lea', 'paul')],
      personIds: ['louis', 'paul', 'lea', 'marie'],
      unions: [couple('paul', 'marie')]
    })

    expect(generations.get('marie')).toBe(2)
  })

  it('[generations] counts a child below its lowest parent', () => {
    const generations = generationNumbers({
      filiations: [
        childOf('paul', 'louis'),
        childOf('lea', 'paul'),
        childOf('lea', 'anne')
      ],
      personIds: ['louis', 'paul', 'anne', 'lea'],
      unions: []
    })

    expect(generations.get('lea')).toBe(3)
  })

  it('[generations] ends on partners from different generations', () => {
    const generations = generationNumbers({
      filiations: [childOf('paul', 'louis')],
      personIds: ['louis', 'paul'],
      unions: [couple('louis', 'paul'), couple('paul', null)]
    })

    expect(Math.max(...generations.values())).toBeLessThanOrEqual(2)
  })
})
