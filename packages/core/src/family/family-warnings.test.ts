import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from './demo-family'
import { familyWarnings } from './family-warnings'
import { replayOperations } from './replay-operations'

const warningsAfter = (operationCount: number) => {
  const family = replayOperations(
    DEMO_FAMILY_OPERATIONS.slice(0, operationCount)
  )
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return familyWarnings(family.data)
}

const reneCorrection = DEMO_FAMILY_OPERATIONS.findIndex(
  (operation) =>
    operation.type === 'person.update' && operation.personId === 'rene-morel'
)

describe('[warnings] implausible dates', () => {
  it('[warnings] flags the demo family’s one wrong record and nothing else', () => {
    expect(warningsAfter(DEMO_FAMILY_OPERATIONS.length)).toEqual([
      { kind: 'death_before_birth', personId: 'marie-le-goff' }
    ])
  })

  it('[warnings] flags a child born before their parent until the record is fixed', () => {
    const childWarning = {
      childId: 'rene-morel',
      kind: 'born_before_parent',
      parentId: 'jeanne-morel'
    }
    expect(warningsAfter(reneCorrection)).toContainEqual(childWarning)
    expect(warningsAfter(reneCorrection + 1)).not.toContainEqual(childWarning)
  })
})
