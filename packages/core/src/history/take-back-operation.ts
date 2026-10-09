import { Result } from '@adrienlcp/result'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'
import type { HistoryRefusal } from '@arbor/protocol/history-refusal'
import type { Operation } from '@arbor/protocol/operation'

import { invertOperation } from '../family/invert-operation'
import { laterDependents } from './later-dependents'
import { takenBackRevisions } from './taken-back-revisions'

/** The inverses of entries, latest first, as one operation. */
const inverseOf = (entries: readonly ChangeLogEntry[]): Operation => {
  const inverses = entries
    .toSorted((first, second) => second.revision - first.revision)
    .map((entry) => invertOperation(entry.operation))
  const [only, ...rest] = inverses
  return only !== undefined && rest.length === 0
    ? only
    : { operations: inverses, type: 'group' }
}

/**
 * The operation that takes the chosen entries back together, or why it cannot:
 * one is missing, one is already taken back, or later entries build on them.
 * `entries` runs oldest first and holds every entry from the earliest chosen
 * one to the latest.
 */
export const undoOperationFor = ({
  entries,
  revisions
}: {
  entries: readonly ChangeLogEntry[]
  revisions: readonly number[]
}): Result<Operation, HistoryRefusal> => {
  const chosen = new Set(revisions)
  const chosenEntries = entries.filter((entry) => chosen.has(entry.revision))
  if (chosenEntries.length !== chosen.size) {
    return Result.failure('revision_not_found')
  }

  const takenBack = takenBackRevisions(entries)
  if (chosenEntries.some((entry) => takenBack.has(entry.revision))) {
    return Result.failure('already_undone')
  }
  if (laterDependents({ entries, revisions }).length > 0) {
    return Result.failure('later_changes_depend')
  }
  return Result.success(inverseOf(chosenEntries))
}

/**
 * The operation that brings the family back to how it stood at a past
 * revision: every later entry taken back, latest first, undone ones and their
 * undoes alike, so the family lands exactly where it was. `entriesSince` is
 * the whole log after that revision.
 */
export const restoreOperationFor = (
  entriesSince: readonly ChangeLogEntry[]
): Result<Operation, 'nothing_to_restore'> =>
  entriesSince.length === 0
    ? Result.failure('nothing_to_restore')
    : Result.success(inverseOf(entriesSince))
