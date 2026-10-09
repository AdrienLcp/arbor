import type { EntityId } from '@arbor/protocol/entity-id'
import type { EntityOperation, Operation } from '@arbor/protocol/operation'

/** One entity of a family, named by its kind and its id. */
type EntityKey =
  `${'event' | 'filiation' | 'person' | 'photo' | 'union'}:${EntityId}`

/** What one part of an operation touches: its own entity, the ones it links to, and which fields it changes. */
export type OperationReach = {
  /** The fields an update changes; `null` when the part creates, removes, bins or restores its subject. */
  changedFields: ReadonlySet<string> | null
  references: readonly EntityKey[]
  subject: EntityKey
}

const personKey = (id: EntityId): EntityKey => `person:${id}`
const photoKey = (id: EntityId): EntityKey => `photo:${id}`

const personKeys = (ids: readonly (EntityId | null | undefined)[]) =>
  ids.filter((id) => id != null).map(personKey)

const photoKeys = (ids: readonly (EntityId | null | undefined)[]) =>
  ids.filter((id) => id != null).map(photoKey)

const fieldsOf = (after: object): ReadonlySet<string> =>
  new Set(Object.keys(after))

const reachOfPart = (part: EntityOperation): OperationReach => {
  switch (part.type) {
    case 'person.create':
    case 'person.remove':
      return {
        changedFields: null,
        references: photoKeys([part.person.portraitPhotoId]),
        subject: personKey(part.person.id)
      }
    case 'person.update':
      return {
        changedFields: fieldsOf(part.after),
        references: photoKeys([part.after.portraitPhotoId]),
        subject: personKey(part.personId)
      }
    case 'person.bin':
    case 'person.restore':
      return {
        changedFields: null,
        references: [],
        subject: personKey(part.personId)
      }
    case 'union.create':
    case 'union.remove':
      return {
        changedFields: null,
        references: personKeys(part.union.partnerIds),
        subject: `union:${part.union.id}`
      }
    case 'union.update':
      return {
        changedFields: fieldsOf(part.after),
        references: [],
        subject: `union:${part.unionId}`
      }
    case 'filiation.create':
    case 'filiation.remove':
      return {
        changedFields: null,
        references: personKeys([
          part.filiation.childId,
          part.filiation.parentId
        ]),
        subject: `filiation:${part.filiation.id}`
      }
    case 'filiation.update':
      return {
        changedFields: fieldsOf(part.after),
        references: [],
        subject: `filiation:${part.filiationId}`
      }
    case 'event.create':
    case 'event.remove':
      return {
        changedFields: null,
        references: personKeys([part.event.personId]),
        subject: `event:${part.event.id}`
      }
    case 'event.update':
      return {
        changedFields: fieldsOf(part.after),
        references: [],
        subject: `event:${part.eventId}`
      }
    case 'photo.create':
    case 'photo.remove':
      return {
        changedFields: null,
        references: personKeys([part.photo.personId]),
        subject: photoKey(part.photo.id)
      }
    case 'photo.update':
      return {
        changedFields: fieldsOf(part.after),
        references: personKeys([part.after.personId]),
        subject: photoKey(part.photoId)
      }
  }
}

/** The single-entity parts of an operation, in the order they apply. */
export const partsOf = (operation: Operation): EntityOperation[] =>
  operation.type === 'group'
    ? operation.operations.flatMap(partsOf)
    : [operation]

/** What every part of an operation touches. */
export const reachOf = (operation: Operation): OperationReach[] =>
  partsOf(operation).map(reachOfPart)

/**
 * Whether a later part relies on an earlier one, so taking the earlier back
 * alone would undo what the later one did or leave it pointing at nothing:
 * both write the same field of one entity, one of them creates, removes, bins
 * or restores it, or the later part links to an entity the earlier one
 * creates or removes.
 */
export const buildsOn = ({
  earlier,
  later
}: {
  earlier: OperationReach
  later: OperationReach
}): boolean => {
  if (later.subject === earlier.subject) {
    return (
      later.changedFields === null ||
      earlier.changedFields === null ||
      !later.changedFields.isDisjointFrom(earlier.changedFields)
    )
  }
  return (
    earlier.changedFields === null && later.references.includes(earlier.subject)
  )
}
