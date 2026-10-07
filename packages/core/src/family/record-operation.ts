import { Result } from '@adrienlcp/result'

import { filiationFieldsSchema } from '@arbor/protocol/filiation'
import { lifeEventFieldsSchema } from '@arbor/protocol/life-event'
import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'
import { personFieldsSchema } from '@arbor/protocol/person'
import { photoFieldsSchema } from '@arbor/protocol/photo'
import { unionFieldsSchema } from '@arbor/protocol/union'

import { applyOperation } from './apply-operation'
import type { FamilyState } from './family-state'

type FieldsParser<Fields> = { parse: (value: unknown) => Fields }

/** The values `entity` holds today for the fields an edit changes. */
const fieldsNow = <Fields>(
  parser: FieldsParser<Fields>,
  entity: object,
  changed: object
): Fields =>
  parser.parse(
    Object.fromEntries(
      Object.entries(entity).filter(([name]) => Object.hasOwn(changed, name))
    )
  )

/**
 * The operation as the log must record it: an edit's `before` and a removal's
 * entity come from the family itself, never from a client that may have read an
 * older state. Left as sent when the entity is missing, so applying it refuses.
 */
const rebased = (family: FamilyState, operation: Operation): Operation => {
  switch (operation.type) {
    case 'person.update': {
      const person = family.persons.get(operation.personId)
      return person === undefined
        ? operation
        : {
            ...operation,
            before: fieldsNow(personFieldsSchema, person, operation.after)
          }
    }
    case 'person.remove':
      return {
        ...operation,
        person: family.persons.get(operation.person.id) ?? operation.person
      }
    case 'union.update': {
      const union = family.unions.get(operation.unionId)
      return union === undefined
        ? operation
        : {
            ...operation,
            before: fieldsNow(unionFieldsSchema, union, operation.after)
          }
    }
    case 'union.remove':
      return {
        ...operation,
        union: family.unions.get(operation.union.id) ?? operation.union
      }
    case 'filiation.update': {
      const filiation = family.filiations.get(operation.filiationId)
      return filiation === undefined
        ? operation
        : {
            ...operation,
            before: fieldsNow(filiationFieldsSchema, filiation, operation.after)
          }
    }
    case 'filiation.remove':
      return {
        ...operation,
        filiation:
          family.filiations.get(operation.filiation.id) ?? operation.filiation
      }
    case 'event.update': {
      const event = family.events.get(operation.eventId)
      return event === undefined
        ? operation
        : {
            ...operation,
            before: fieldsNow(lifeEventFieldsSchema, event, operation.after)
          }
    }
    case 'event.remove':
      return {
        ...operation,
        event: family.events.get(operation.event.id) ?? operation.event
      }
    case 'photo.update': {
      const photo = family.photos.get(operation.photoId)
      return photo === undefined
        ? operation
        : {
            ...operation,
            before: fieldsNow(photoFieldsSchema, photo, operation.after)
          }
    }
    case 'photo.remove':
      return {
        ...operation,
        photo: family.photos.get(operation.photo.id) ?? operation.photo
      }
    default:
      return operation
  }
}

/** A family after one more recorded operation, with the operation as the log keeps it. */
export type RecordedOperation = { family: FamilyState; operation: Operation }

/**
 * Turns a client's edit into a log entry: each part is rebased on the family
 * as it stands when that part applies, so the last write wins field by field
 * and the history holds the values it replaced.
 */
export const recordOperation = (
  family: FamilyState,
  operation: Operation
): Result<RecordedOperation, OperationRefusal> => {
  if (operation.type !== 'group') {
    const recorded = rebased(family, operation)
    const applied = applyOperation(family, recorded)
    return applied.status === 'failure'
      ? applied
      : Result.success({ family: applied.data, operation: recorded })
  }

  let current = family
  const recordedParts: Operation[] = []
  for (const part of operation.operations) {
    const recorded = recordOperation(current, part)
    if (recorded.status === 'failure') return recorded
    current = recorded.data.family
    recordedParts.push(recorded.data.operation)
  }
  return Result.success({
    family: current,
    operation: { operations: recordedParts, type: 'group' }
  })
}
