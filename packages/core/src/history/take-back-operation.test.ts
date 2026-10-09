import { describe, expect, it } from 'vitest'

import type { ChangeLogEntry, EntryCause } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import type { FamilyState } from '../family/family-state'
import { recordOperation } from '../family/record-operation'
import { replayOperations } from '../family/replay-operations'
import { laterDependents } from './later-dependents'
import { restoreOperationFor, undoOperationFor } from './take-back-operation'
import { takenBackRevisions } from './taken-back-revisions'

const DEMO_REVISION = DEMO_FAMILY_OPERATIONS.length

const rename = (personId: string, givenNames: string): Operation => ({
  after: { givenNames },
  before: { givenNames: 'stale' },
  personId,
  type: 'person.update'
})

const editNotes = (personId: string, notes: string): Operation => ({
  after: { notes },
  before: { notes: 'stale' },
  personId,
  type: 'person.update'
})

const bin = (personId: string): Operation => ({ personId, type: 'person.bin' })

/** A change log as the server keeps it: the demo family, then each step recorded on top, rebased like a real write. */
const logOf = (
  steps: readonly (
    | Operation
    | ((entries: readonly ChangeLogEntry[]) => {
        cause: EntryCause
        operation: Operation
      })
  )[]
) => {
  const demo = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (demo.status === 'failure') throw new Error('The demo family is refused')

  let family: FamilyState = demo.data
  const states = new Map<number, FamilyState>([[DEMO_REVISION, family]])
  const entries: ChangeLogEntry[] = DEMO_FAMILY_OPERATIONS.map(
    (operation, index) => ({
      at: '2026-10-01T10:00:00Z',
      author: { kind: 'named', name: 'Papa' },
      cause: null,
      operation,
      revision: index + 1
    })
  )

  for (const step of steps) {
    const { cause, operation } =
      typeof step === 'function'
        ? step(entries)
        : { cause: null, operation: step }
    const recorded = recordOperation(family, operation)
    if (recorded.status === 'failure') throw new Error(recorded.error)
    family = recorded.data.family
    const revision = entries.length + 1
    entries.push({
      at: '2026-10-08T10:00:00Z',
      author: { kind: 'named', name: 'Kevin' },
      cause,
      operation: recorded.data.operation,
      revision
    })
    states.set(revision, family)
  }
  return {
    entries,
    family,
    stateAt: (revision: number) => states.get(revision)
  }
}

const undoing =
  (revisions: number[]) => (entries: readonly ChangeLogEntry[]) => {
    const operation = undoOperationFor({ entries, revisions })
    if (operation.status === 'failure') throw new Error(operation.error)
    return {
      cause: { kind: 'undo', revisions } satisfies EntryCause,
      operation: operation.data
    }
  }

const restoringTo =
  (revision: number) => (entries: readonly ChangeLogEntry[]) => {
    const operation = restoreOperationFor(
      entries.filter((entry) => entry.revision > revision)
    )
    if (operation.status === 'failure') throw new Error(operation.error)
    return {
      cause: { kind: 'restore', revision } satisfies EntryCause,
      operation: operation.data
    }
  }

/** The revision of the n-th step recorded after the demo family, counting from 1. */
const step = (n: number) => DEMO_REVISION + n

describe('[history] entries taken back', () => {
  it('[history] names the undo that took an entry back', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      undoing([step(1)])
    ])

    expect([...takenBackRevisions(entries)]).toEqual([[step(1), step(2)]])
  })

  it('[history] brings an entry back when its undo is undone', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      undoing([step(1)]),
      undoing([step(2)])
    ])

    expect([...takenBackRevisions(entries)]).toEqual([[step(2), step(3)]])
  })

  it('[history] takes back every entry between a restore and the revision it restores', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      bin('lucie-morel'),
      restoringTo(step(0))
    ])

    expect([...takenBackRevisions(entries)].toSorted()).toEqual([
      [step(1), step(3)],
      [step(2), step(3)]
    ])
  })
})

describe('[history] later entries that depend on an earlier one', () => {
  it('[history] lets an edit of another field stand on its own', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      editNotes('anne-morel', 'Née à Brest')
    ])

    expect(laterDependents({ entries, revisions: [step(1)] })).toEqual([])
  })

  it('[history] ties a later edit of the same field to the earlier one', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      rename('anne-morel', 'Anne-Marie')
    ])

    expect(laterDependents({ entries, revisions: [step(1)] })).toEqual([
      step(2)
    ])
  })

  it('[history] follows what links to a new person, and what builds on that link', () => {
    const { entries } = logOf([
      {
        person: {
          birth: null,
          birthSurname: null,
          death: null,
          givenNames: 'Léo',
          id: 'leo-morel',
          livingOverride: null,
          notes: '',
          portraitPhotoId: null,
          sex: 'male',
          surname: 'Morel'
        },
        type: 'person.create'
      },
      rename('anne-morel', 'Annie'),
      {
        filiation: {
          childId: 'leo-morel',
          id: 'anne-morel--leo-morel',
          kind: 'birth',
          parentId: 'anne-morel'
        },
        type: 'filiation.create'
      },
      {
        after: { kind: 'adoption' },
        before: { kind: 'birth' },
        filiationId: 'anne-morel--leo-morel',
        type: 'filiation.update'
      }
    ])

    expect(laterDependents({ entries, revisions: [step(1)] })).toEqual([
      step(3),
      step(4)
    ])
  })

  it('[history] ignores a later edit already taken back', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      rename('anne-morel', 'Anne-Marie'),
      undoing([step(2)])
    ])

    expect(laterDependents({ entries, revisions: [step(1)] })).toEqual([])
  })
})

describe('[history] undo', () => {
  it('[history] takes back an entry and what depends on it, all together', () => {
    const { entries, stateAt } = logOf([
      rename('anne-morel', 'Annie'),
      rename('anne-morel', 'Anne-Marie'),
      bin('lucie-morel'),
      undoing([step(1), step(2)])
    ])

    const family = logOf([]).family
    const after = stateAt(step(4))
    expect(after?.persons.get('anne-morel')).toEqual(
      family.persons.get('anne-morel')
    )
    expect(after?.binnedPersonIds.has('lucie-morel')).toBe(true)
    expect(takenBackRevisions(entries).get(step(1))).toBe(step(4))
  })

  it('[history] refuses an entry that later ones depend on', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      rename('anne-morel', 'Anne-Marie')
    ])

    expect(undoOperationFor({ entries, revisions: [step(1)] })).toEqual({
      error: 'later_changes_depend',
      status: 'failure'
    })
  })

  it('[history] refuses an entry already taken back, or one the log does not hold', () => {
    const { entries } = logOf([
      rename('anne-morel', 'Annie'),
      undoing([step(1)])
    ])

    expect(undoOperationFor({ entries, revisions: [step(1)] })).toEqual({
      error: 'already_undone',
      status: 'failure'
    })
    expect(undoOperationFor({ entries, revisions: [step(9)] })).toEqual({
      error: 'revision_not_found',
      status: 'failure'
    })
  })
})

describe('[history] restore to a moment', () => {
  it('[history] brings the whole family back to how it stood, through undoes and bins', () => {
    const { family, stateAt } = logOf([
      bin('lucie-morel'),
      bin('noah-morel'),
      rename('anne-morel', 'Vandale'),
      undoing([step(3)]),
      rename('karim-morel', 'Vandale'),
      bin('emma-bertin'),
      restoringTo(step(0))
    ])

    expect(family).toEqual(stateAt(step(0)))
  })

  it('[history] has nothing to restore at the latest revision', () => {
    expect(restoreOperationFor([])).toEqual({
      error: 'nothing_to_restore',
      status: 'failure'
    })
  })
})
