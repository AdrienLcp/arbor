import { describe, expect, it } from 'vitest'

import { operationSchema } from '@arbor/protocol/operation'

import { applyOperation } from './apply-operation'
import { DEMO_FAMILY_OPERATIONS } from './demo-family'
import type { FamilyState } from './family-state'
import { invertOperation } from './invert-operation'
import { replayOperations } from './replay-operations'

const replayed = (operations = DEMO_FAMILY_OPERATIONS): FamilyState => {
  const family = replayOperations(operations)
  if (family.status === 'failure') {
    throw new Error(`Refused: ${JSON.stringify(family.error)}`)
  }
  return family.data
}

const parentsOf = (family: FamilyState, childId: string) =>
  family.filiations
    .values()
    .filter((filiation) => filiation.childId === childId)
    .map(({ kind, parentId }) => `${parentId} (${kind})`)
    .toArray()
    .toSorted()

describe('[replay] the demo family', () => {
  it('[replay] is valid on the wire', () => {
    for (const operation of DEMO_FAMILY_OPERATIONS) {
      expect(operationSchema.safeParse(operation).error).toBeUndefined()
    }
  })

  it('[replay] rebuilds the family the log describes', () => {
    const family = replayed()
    expect(family.persons.size).toBe(22)
    expect([...family.binnedPersonIds]).toEqual(['simone-morel-duplicate'])
    expect(parentsOf(family, 'lucie-morel')).toEqual([
      'anne-morel (birth)',
      'sophie-garnier (adoption)'
    ])
    expect(parentsOf(family, 'thomas-bertin')).toEqual([
      'odile-bertin (birth)',
      'pierre-morel (step)'
    ])
    expect(parentsOf(family, 'rene-morel')).toEqual(['jeanne-morel (birth)'])
    expect(family.unions.get('anne-sophie')?.kind).toBe('marriage')
    expect(family.persons.get('auguste-morel')?.portraitPhotoId).toBe(
      'auguste-portrait'
    )
  })

  it('[replay] rebuilds the same state every time', () => {
    expect(replayed()).toEqual(replayed())
  })
})

describe('[replay] undo', () => {
  it('[replay] leaves the family unchanged after any operation and its inverse', () => {
    for (const [index, operation] of DEMO_FAMILY_OPERATIONS.entries()) {
      const before = replayed(DEMO_FAMILY_OPERATIONS.slice(0, index))
      const applied = applyOperation(before, operation)
      if (applied.status === 'failure') throw new Error(applied.error)
      const undone = applyOperation(applied.data, invertOperation(operation))

      expect(undone, `operation ${index}: ${operation.type}`).toEqual({
        data: before,
        status: 'success'
      })
    }
  })

  it('[replay] undoes the whole log, latest first, back to an empty family', () => {
    const undoAll = DEMO_FAMILY_OPERATIONS.toReversed().map(invertOperation)
    const family = replayOperations([...DEMO_FAMILY_OPERATIONS, ...undoAll])
    expect(family.status).toBe('success')
    if (family.status === 'success') {
      expect(family.data.persons.size).toBe(0)
      expect(family.data.filiations.size).toBe(0)
    }
  })
})
