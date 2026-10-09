import { describe, expect, it } from 'vitest'

import type { Author, ChangeLogEntry } from '@arbor/protocol/change-log'

import { historyDays } from './history-days'

const ANNE: Author = { kind: 'person', personId: 'anne' }
const COUSIN: Author = { kind: 'named', name: 'Cousin Luc' }

const entry = (
  revision: number,
  at: string,
  author: Author
): ChangeLogEntry => ({
  at,
  author,
  cause: null,
  operation: { personId: 'paul', type: 'person.bin' },
  revision
})

const dayKeyOf = (at: string) => at.slice(0, 10)

describe('[history] days of the history', () => {
  it('[history] puts the newest day first, and one author’s run under one signature', () => {
    const days = historyDays({
      dayKeyOf,
      entries: [
        entry(1, '2026-10-07T09:00:00Z', ANNE),
        entry(2, '2026-10-08T09:00:00Z', ANNE),
        entry(3, '2026-10-08T09:05:00Z', ANNE),
        entry(4, '2026-10-08T10:00:00Z', COUSIN)
      ]
    })

    expect(
      days.map(({ dayKey, runs }) => ({
        dayKey,
        runs: runs.map((run) => run.entries.map(({ revision }) => revision))
      }))
    ).toEqual([
      { dayKey: '2026-10-08', runs: [[4], [3, 2]] },
      { dayKey: '2026-10-07', runs: [[1]] }
    ])
  })

  it('[history] starts a new run when the same author comes back after someone else', () => {
    const days = historyDays({
      dayKeyOf,
      entries: [
        entry(1, '2026-10-08T09:00:00Z', ANNE),
        entry(2, '2026-10-08T09:05:00Z', COUSIN),
        entry(3, '2026-10-08T09:10:00Z', ANNE)
      ]
    })

    expect(days[0]?.runs.map(({ author }) => author)).toEqual([
      ANNE,
      COUSIN,
      ANNE
    ])
  })
})
