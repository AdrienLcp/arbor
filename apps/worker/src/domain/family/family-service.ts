import { Result } from '@adrienlcp/result'

import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'
import {
  type ChangeLogPage,
  type CreateFamilyInput,
  OPERATIONS_PAGE_SIZE,
  type RecordedOperations,
  type RecordOperationsInput
} from '@arbor/protocol/routes'

import { recordOperation } from '@arbor/core/family/record-operation'

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

/** A batch of edits is one entry of the log, so undoing it undoes the whole gesture. */
const asOneOperation = (operations: readonly Operation[]): Operation => {
  const [only, ...rest] = operations
  return only !== undefined && rest.length === 0
    ? only
    : { operations: [...operations], type: 'group' }
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

  const before = store.readFamily()
  const recorded = recordOperation(before, asOneOperation(input.operations))
  if (recorded.status === 'failure') {
    return input.baseRevision === revision
      ? recorded
      : Result.failure('revision_conflict')
  }

  const entry = {
    at,
    author: input.author,
    operation: recorded.data.operation,
    revision: revision + 1
  }
  store.record({ after: recorded.data.family, before, entry })
  return Result.success({ revision: entry.revision })
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
