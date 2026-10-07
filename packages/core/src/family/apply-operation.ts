import { Result } from '@adrienlcp/result'

import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { applyEventOperation } from './apply-event-operation'
import { applyFiliationOperation } from './apply-filiation-operation'
import { applyPersonOperation } from './apply-person-operation'
import { applyPhotoOperation } from './apply-photo-operation'
import { applyUnionOperation } from './apply-union-operation'
import type { FamilyState } from './family-state'

/** Which operation of a sequence was refused, and why. */
export type SequenceRefusal = { index: number; refusal: OperationRefusal }

/** Applies operations one after the other, stopping at the first refusal. */
export const applyInOrder = (
  family: FamilyState,
  operations: readonly Operation[]
): Result<FamilyState, SequenceRefusal> => {
  let current = family
  for (const [index, operation] of operations.entries()) {
    const next = applyOperation(current, operation)
    if (next.status === 'failure') {
      return Result.failure({ index, refusal: next.error })
    }
    current = next.data
  }
  return Result.success(current)
}

/** The family after one more operation, or the rule it would break. The family passed in is never changed. */
export const applyOperation = (
  family: FamilyState,
  operation: Operation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'group': {
      const grouped = applyInOrder(family, operation.operations)
      return grouped.status === 'failure'
        ? Result.failure(grouped.error.refusal)
        : grouped
    }
    case 'person.create':
    case 'person.update':
    case 'person.bin':
    case 'person.restore':
    case 'person.remove':
      return applyPersonOperation(family, operation)
    case 'union.create':
    case 'union.update':
    case 'union.remove':
      return applyUnionOperation(family, operation)
    case 'filiation.create':
    case 'filiation.update':
    case 'filiation.remove':
      return applyFiliationOperation(family, operation)
    case 'event.create':
    case 'event.update':
    case 'event.remove':
      return applyEventOperation(family, operation)
    case 'photo.create':
    case 'photo.update':
    case 'photo.remove':
      return applyPhotoOperation(family, operation)
  }
}
