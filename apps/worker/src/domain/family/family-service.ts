import { Result } from '@adrienlcp/result'

import type { Role } from '@arbor/protocol/access'
import type { Author, EntryCause } from '@arbor/protocol/change-log'
import type { FamilySettings } from '@arbor/protocol/family'
import type { HistoryRefusal } from '@arbor/protocol/history-refusal'
import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'
import {
  type ChangeLogPage,
  type CreateFamilyInput,
  OPERATIONS_PAGE_SIZE,
  type RecordedOperations,
  type RecordOperationsInput,
  type RestoreInput,
  type UndoInput,
  type UpdateFamilySettingsInput
} from '@arbor/protocol/routes'

import { recordOperation } from '@arbor/core/family/record-operation'
import {
  restoreOperationFor,
  undoOperationFor
} from '@arbor/core/history/take-back-operation'

import { issueKey, type MintedKey } from '@/domain/access/access-service'
import type { AccessStore } from '@/domain/access/access-store'

import type { FamilyStore } from './family-store'

/** Starts a family in an empty object, with its keeper link and its family link. */
export const openFamily = ({
  access,
  at,
  familyKey,
  input,
  keeperKey,
  store
}: {
  access: AccessStore
  at: string
  familyKey: MintedKey
  input: CreateFamilyInput
  keeperKey: MintedKey
  store: FamilyStore
}): Result<void, 'family_exists'> => {
  if (store.readSettings() !== null) return Result.failure('family_exists')

  store.writeSettings({ hidesLivingFromReaders: true, name: input.name })
  issueKey({ at, minted: keeperKey, role: 'keeper', store: access })
  issueKey({ at, minted: familyKey, role: 'contributor', store: access })
  return Result.success()
}

/**
 * Applies a keeper's change to the family's settings. They stay out of the
 * change log, which holds the family's people and what links them: a setting
 * says who sees what, and changing it back is the keeper's undo.
 */
export const updateSettings = ({
  changes,
  current,
  store
}: {
  changes: UpdateFamilySettingsInput
  current: FamilySettings
  store: FamilyStore
}): FamilySettings => {
  const updated = { ...current, ...changes }
  store.writeSettings(updated)
  return updated
}

/** A batch of edits is one entry of the log, so undoing it undoes the whole gesture. */
const asOneOperation = (operations: readonly Operation[]): Operation => {
  const [only, ...rest] = operations
  return only !== undefined && rest.length === 0
    ? only
    : { operations: [...operations], type: 'group' }
}

/** Applies one operation to the family as it stands and appends it to the log as the next entry. */
const appendEntry = ({
  at,
  author,
  cause,
  operation,
  store
}: {
  at: string
  author: Author
  cause: EntryCause | null
  operation: Operation
  store: FamilyStore
}): Result<RecordedOperations, OperationRefusal> => {
  const before = store.readFamily()
  const recorded = recordOperation(before, operation)
  if (recorded.status === 'failure') return recorded

  const entry = {
    at,
    author,
    cause,
    operation: recorded.data.operation,
    revision: store.readRevision() + 1
  }
  store.record({ after: recorded.data.family, before, entry })
  return Result.success({ revision: entry.revision })
}

export type RecordRefusal = OperationRefusal | 'revision_conflict'

/**
 * Appends a client's edits to the log. Made against the latest revision, a
 * refusal is the client's to fix; made against an older one, the family has
 * moved under it, and the client must reload before trying again.
 */
export const recordOperations = ({
  at,
  input,
  store
}: {
  at: string
  input: RecordOperationsInput
  store: FamilyStore
}): Result<RecordedOperations, RecordRefusal> => {
  const revision = store.readRevision()
  if (input.baseRevision > revision) {
    return Result.failure('revision_conflict')
  }

  const appended = appendEntry({
    at,
    author: input.author,
    cause: null,
    operation: asOneOperation(input.operations),
    store
  })
  return appended.status === 'failure' && input.baseRevision !== revision
    ? Result.failure('revision_conflict')
    : appended
}

export type UndoRefusal = HistoryRefusal | OperationRefusal | 'forbidden'

/**
 * Takes entries back together, as one new entry the server works out from its
 * own log. Taking back a keeper's restore is the keeper's alone: anyone else
 * could hand the family back to whoever vandalised it.
 */
export const undoEntries = ({
  at,
  input,
  role,
  store
}: {
  at: string
  input: UndoInput
  role: Role
  store: FamilyStore
}): Result<RecordedOperations, UndoRefusal> => {
  const revisions = [...new Set(input.revisions)].toSorted(
    (first, second) => first - second
  )
  const entries = store.readLog({ after: Math.min(...revisions) - 1 })
  const takesBackARestore = entries.some(
    (entry) =>
      revisions.includes(entry.revision) && entry.cause?.kind === 'restore'
  )
  if (takesBackARestore && role !== 'keeper') {
    return Result.failure('forbidden')
  }

  const undo = undoOperationFor({ entries, revisions })
  if (undo.status === 'failure') return undo
  return appendEntry({
    at,
    author: input.author,
    cause: { kind: 'undo', revisions },
    operation: undo.data,
    store
  })
}

export type RestoreRefusal =
  | OperationRefusal
  | 'nothing_to_restore'
  | 'revision_conflict'
  | 'revision_not_found'

/**
 * Brings the whole family back to how it stood at a past revision, as one
 * entry that can itself be undone. Made from a preview of `baseRevision`: an
 * edit since then would be taken back unseen, so it is a conflict instead.
 */
export const restoreFamily = ({
  at,
  input,
  store
}: {
  at: string
  input: RestoreInput
  store: FamilyStore
}): Result<RecordedOperations, RestoreRefusal> => {
  const revision = store.readRevision()
  if (input.baseRevision !== revision) {
    return Result.failure('revision_conflict')
  }
  if (input.revision > revision) return Result.failure('revision_not_found')

  const restore = restoreOperationFor(store.readLog({ after: input.revision }))
  if (restore.status === 'failure') return restore
  return appendEntry({
    at,
    author: input.author,
    cause: { kind: 'restore', revision: input.revision },
    operation: restore.data,
    store
  })
}

/** One page of the log, oldest first, after the revision the reader already has. */
export const readLogPage = ({
  after,
  store
}: {
  after: number
  store: FamilyStore
}): ChangeLogPage => {
  const entries = store.readLog({ after, limit: OPERATIONS_PAGE_SIZE + 1 })
  const page = entries.slice(0, OPERATIONS_PAGE_SIZE)
  const hasMore = entries.length > OPERATIONS_PAGE_SIZE
  return {
    entries: page,
    nextAfter: hasMore ? (page.at(-1)?.revision ?? null) : null
  }
}
