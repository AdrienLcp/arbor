import { describe, expect, it } from 'vitest'

import type { Author, ChangeLogEntry } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'

import { whoBinned } from './who-binned'

const JEANNE: Author = { kind: 'person', personId: 'jeanne' }
const COUSIN: Author = { kind: 'named', name: 'Cousin Luc' }

const entry = (
  revision: number,
  author: Author,
  operation: Operation
): ChangeLogEntry => ({
  at: '2026-10-08T09:00:00.000Z',
  author,
  cause: null,
  operation,
  revision
})

describe('whoBinned', () => {
  it('finds the bin inside a group of changes', () => {
    const entries = [
      entry(4, JEANNE, {
        operations: [
          { personId: 'anne', type: 'person.bin' },
          { personId: 'paul', type: 'person.bin' }
        ],
        type: 'group'
      })
    ]

    expect(whoBinned(entries, 'paul')).toEqual(JEANNE)
  })

  it('keeps the latest bin when the person was restored and binned again', () => {
    const entries = [
      entry(4, JEANNE, { personId: 'paul', type: 'person.bin' }),
      entry(5, JEANNE, { personId: 'paul', type: 'person.restore' }),
      entry(6, COUSIN, { personId: 'paul', type: 'person.bin' })
    ]

    expect(whoBinned(entries, 'paul')).toEqual(COUSIN)
  })

  it('answers no one when only other people were binned', () => {
    const entries = [entry(4, JEANNE, { personId: 'anne', type: 'person.bin' })]

    expect(whoBinned(entries, 'paul')).toBeNull()
  })
})
