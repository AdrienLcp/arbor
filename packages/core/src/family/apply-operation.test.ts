import { describe, expect, it } from 'vitest'

import type { Filiation } from '@arbor/protocol/filiation'
import type { Operation } from '@arbor/protocol/operation'

import { applyOperation } from './apply-operation'
import { DEMO_FAMILY_OPERATIONS } from './demo-family'
import type { FamilyState } from './family-state'
import { replayOperations } from './replay-operations'

const demoFamily = (): FamilyState => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const linkParent = (filiation: Omit<Filiation, 'id'>): Operation => ({
  filiation: { ...filiation, id: 'new-filiation' },
  type: 'filiation.create'
})

const refusalOf = (family: FamilyState, operation: Operation) => {
  const outcome = applyOperation(family, operation)
  return outcome.status === 'failure' ? outcome.error : null
}

describe('[family] ancestry', () => {
  it('[family] refuses a filiation that makes someone their own ancestor', () => {
    const family = demoFamily()
    expect(
      refusalOf(
        family,
        linkParent({
          childId: 'auguste-morel',
          kind: 'adoption',
          parentId: 'lucie-morel'
        })
      )
    ).toBe('ancestry_cycle')
    expect(
      refusalOf(
        family,
        linkParent({
          childId: 'emma-bertin',
          kind: 'step',
          parentId: 'emma-bertin'
        })
      )
    ).toBe('ancestry_cycle')
  })

  it('[family] accepts a new parent from another branch', () => {
    expect(
      refusalOf(
        demoFamily(),
        linkParent({
          childId: 'emma-bertin',
          kind: 'foster',
          parentId: 'simone-morel'
        })
      )
    ).toBeNull()
  })
})

describe('[family] birth parents', () => {
  it('[family] refuses a third birth parent and accepts an adoptive one', () => {
    const family = demoFamily()
    expect(
      refusalOf(
        family,
        linkParent({
          childId: 'anne-morel',
          kind: 'birth',
          parentId: 'sophie-garnier'
        })
      )
    ).toBe('too_many_birth_parents')
    expect(
      refusalOf(
        family,
        linkParent({
          childId: 'anne-morel',
          kind: 'adoption',
          parentId: 'sophie-garnier'
        })
      )
    ).toBeNull()
  })

  it('[family] refuses turning a filiation into a third birth one, accepts a second', () => {
    const toBirth: Operation = {
      after: { kind: 'birth' },
      before: { kind: 'adoption' },
      filiationId: 'new-filiation',
      type: 'filiation.update'
    }
    const withAdoptiveParent = (childId: string) =>
      applyOperation(
        demoFamily(),
        linkParent({ childId, kind: 'adoption', parentId: 'sophie-garnier' })
      )

    const anne = withAdoptiveParent('anne-morel')
    const emma = withAdoptiveParent('emma-bertin')
    if (anne.status === 'failure' || emma.status === 'failure') {
      throw new Error('The adoption is refused')
    }
    expect(refusalOf(anne.data, toBirth)).toBe('too_many_birth_parents')
    expect(refusalOf(emma.data, toBirth)).toBeNull()
  })

  it('[family] refuses a second link between the same child and parent', () => {
    expect(
      refusalOf(
        demoFamily(),
        linkParent({
          childId: 'anne-morel',
          kind: 'adoption',
          parentId: 'pierre-morel'
        })
      )
    ).toBe('duplicate_filiation')
  })
})

describe('[family] unions', () => {
  it('[family] refuses a union of a person with themselves', () => {
    expect(
      refusalOf(demoFamily(), {
        type: 'union.create',
        union: {
          end: null,
          id: 'new-union',
          kind: 'marriage',
          partnerIds: ['michel-morel', 'michel-morel'],
          start: null
        }
      })
    ).toBe('same_partner')
  })

  it('[family] accepts a union with an unknown partner', () => {
    expect(
      refusalOf(demoFamily(), {
        type: 'union.create',
        union: {
          end: null,
          id: 'new-union',
          kind: 'unknown',
          partnerIds: ['jeanne-morel', null],
          start: null
        }
      })
    ).toBeNull()
  })
})

describe('[family] the bin', () => {
  it('[family] refuses new links to a person in the bin', () => {
    expect(
      refusalOf(
        demoFamily(),
        linkParent({
          childId: 'simone-morel-duplicate',
          kind: 'birth',
          parentId: 'louis-morel'
        })
      )
    ).toBe('person_binned')
  })

  it('[family] removes a person only while nothing links to them', () => {
    const family = demoFamily()
    const emma = family.persons.get('emma-bertin')
    if (!emma) throw new Error('Emma is missing from the demo family')
    expect(refusalOf(family, { person: emma, type: 'person.remove' })).toBe(
      'person_linked'
    )
  })
})

describe('[family] groups', () => {
  it('[family] applies a group all or nothing', () => {
    const family = demoFamily()
    const group: Operation = {
      operations: [
        { personId: 'michel-morel', type: 'person.bin' },
        { personId: 'michel-morel', type: 'person.bin' }
      ],
      type: 'group'
    }
    expect(refusalOf(family, group)).toBe('person_binned')
    expect(family.binnedPersonIds.has('michel-morel')).toBe(false)
  })
})
