import { describe, expect, it } from 'vitest'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { recordOperation } from '../family/record-operation'
import { replayOperations } from '../family/replay-operations'
import { restorePreview } from './restore-preview'

const DEMO_REVISION = DEMO_FAMILY_OPERATIONS.length

const entryOf = (operation: Operation, index: number): ChangeLogEntry => ({
  at: '2026-10-08T10:00:00Z',
  author: { kind: 'named', name: 'Kevin' },
  cause: null,
  operation,
  revision: index + 1
})

/** The demo family, then each operation recorded on top of it as the server would. */
const logAfterDemo = (operations: readonly Operation[]): ChangeLogEntry[] => {
  const demo = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (demo.status === 'failure') throw new Error('The demo family is refused')
  let family = demo.data
  const recorded: Operation[] = []
  for (const operation of operations) {
    const next = recordOperation(family, operation)
    if (next.status === 'failure') throw new Error(next.error)
    family = next.data.family
    recorded.push(next.data.operation)
  }
  return [...DEMO_FAMILY_OPERATIONS, ...recorded].map(entryOf)
}

const rename = (personId: string, givenNames: string): Operation => ({
  after: { givenNames },
  before: { givenNames: 'stale' },
  personId,
  type: 'person.update'
})

const previewOf = (entries: readonly ChangeLogEntry[], revision: number) => {
  const preview = restorePreview({ entries, revision })
  if (preview.status === 'failure') throw new Error('The log is refused')
  return preview.data
}

describe(restorePreview, () => {
  it('brings binned people back and gives renamed people their names again', () => {
    const entries = logAfterDemo([
      { personId: 'rene-morel', type: 'person.bin' },
      rename('jeanne-morel', 'Jeannette')
    ])

    const preview = previewOf(entries, DEMO_REVISION)

    expect(preview.back.map(({ id }) => id)).toEqual(['rene-morel'])
    expect(
      preview.changed.map(({ now, past }) => [now.givenNames, past.givenNames])
    ).toEqual([['Jeannette', 'Jeanne']])
    expect(preview.gone).toEqual([])
    expect(preview.hasOtherChanges).toBe(false)
  })

  it('lets people added since leave the tree', () => {
    const louis = DEMO_FAMILY_OPERATIONS.findIndex(
      (operation) =>
        operation.type === 'person.create' &&
        operation.person.id === 'louis-morel'
    )

    const preview = previewOf(logAfterDemo([]), louis)

    expect(preview.gone.map(({ id }) => id)).toContain('louis-morel')
    expect(preview.back).toEqual([])
    expect(preview.hasOtherChanges).toBe(true)
  })

  it('finds nothing to say when a change was reverted by hand', () => {
    const entries = logAfterDemo([
      rename('jeanne-morel', 'Jeannette'),
      rename('jeanne-morel', 'Jeanne')
    ])

    expect(previewOf(entries, DEMO_REVISION)).toEqual({
      back: [],
      changed: [],
      gone: [],
      hasOtherChanges: false
    })
  })
})
