import { describe, expect, it } from 'vitest'

import type { Operation } from '@arbor/protocol/operation'

import { DEMO_FAMILY_OPERATIONS } from './demo-family'
import type { FamilyState } from './family-state'
import { recordOperation } from './record-operation'
import { replayOperations } from './replay-operations'

const demoFamily = (): FamilyState => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const recorded = (family: FamilyState, operation: Operation) => {
  const outcome = recordOperation(family, operation)
  if (outcome.status === 'failure') throw new Error(outcome.error)
  return outcome.data
}

describe('[record] rebasing on the family', () => {
  it('[record] takes an edit’s before from the family, not from the client', () => {
    const family = demoFamily()
    const { operation } = recorded(family, {
      after: { notes: 'Mobilisé en 1914' },
      before: { notes: 'what an old screen showed' },
      personId: 'auguste-morel',
      type: 'person.update'
    })

    expect(operation).toEqual({
      after: { notes: 'Mobilisé en 1914' },
      before: { notes: family.persons.get('auguste-morel')?.notes },
      personId: 'auguste-morel',
      type: 'person.update'
    })
  })

  it('[record] keeps the stored entity in a removal', () => {
    const family = demoFamily()
    const stored = family.unions.get('auguste-marie')
    if (stored === undefined) throw new Error('The demo union is missing')

    const { operation } = recorded(family, {
      type: 'union.remove',
      union: { ...stored, kind: 'unknown' }
    })

    expect(operation).toEqual({ type: 'union.remove', union: stored })
  })

  it('[record] rebases each part of a group on the parts before it', () => {
    const { family, operation } = recorded(demoFamily(), {
      operations: [
        {
          after: { givenNames: 'Auguste Jean' },
          before: { givenNames: 'stale' },
          personId: 'auguste-morel',
          type: 'person.update'
        },
        {
          after: { givenNames: 'Auguste Jean Marie' },
          before: { givenNames: 'stale' },
          personId: 'auguste-morel',
          type: 'person.update'
        }
      ],
      type: 'group'
    })

    expect(operation.type === 'group' && operation.operations[1]).toMatchObject(
      { before: { givenNames: 'Auguste Jean' } }
    )
    expect(family.persons.get('auguste-morel')?.givenNames).toBe(
      'Auguste Jean Marie'
    )
  })

  it('[record] refuses an edit of someone who is not in the family', () => {
    expect(
      recordOperation(demoFamily(), {
        after: { notes: '' },
        before: { notes: '' },
        personId: 'nobody',
        type: 'person.update'
      })
    ).toEqual({ error: 'person_not_found', status: 'failure' })
  })
})
