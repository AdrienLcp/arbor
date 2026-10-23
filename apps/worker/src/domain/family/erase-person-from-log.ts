import { Result } from '@adrienlcp/result'

import type {
  Author,
  ChangeLogEntry,
  EntryCause
} from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'
import type { EntityOperation, Operation } from '@arbor/protocol/operation'

/** Signs what an erased person did: a person no longer in the tree, which the history already shows as unnamed. */
export const ERASED_AUTHOR: Author = {
  kind: 'person',
  personId: 'erased-person'
}

/** The log once a person is erased from it, and the photos whose files go with them. */
export type LogErasure = {
  entries: ChangeLogEntry[]
  photoIds: ReadonlySet<EntityId>
}

/** The entities that are facts about the person: their couples, their parent and child links, their events, their photos. */
type EntitiesAbout = {
  events: Set<EntityId>
  filiations: Set<EntityId>
  photos: Set<EntityId>
  unions: Set<EntityId>
}

const entityOperationsOf = (operation: Operation): EntityOperation[] =>
  operation.type === 'group'
    ? operation.operations.flatMap(entityOperationsOf)
    : [operation]

/** Every entity that ever pointed at the person in the log, not only those standing today: a removed one still carries them. */
const entitiesAbout = (
  operations: readonly EntityOperation[],
  personId: EntityId
): EntitiesAbout => {
  const about: EntitiesAbout = {
    events: new Set(),
    filiations: new Set(),
    photos: new Set(),
    unions: new Set()
  }
  for (const operation of operations) {
    switch (operation.type) {
      case 'union.create':
      case 'union.remove':
        if (operation.union.partnerIds.includes(personId)) {
          about.unions.add(operation.union.id)
        }
        break
      case 'filiation.create':
      case 'filiation.remove':
        if (
          operation.filiation.childId === personId ||
          operation.filiation.parentId === personId
        ) {
          about.filiations.add(operation.filiation.id)
        }
        break
      case 'event.create':
      case 'event.remove':
        if (operation.event.personId === personId) {
          about.events.add(operation.event.id)
        }
        break
      case 'photo.create':
      case 'photo.remove':
        if (operation.photo.personId === personId) {
          about.photos.add(operation.photo.id)
        }
        break
      case 'photo.update':
        if (
          operation.before.personId === personId ||
          operation.after.personId === personId
        ) {
          about.photos.add(operation.photoId)
        }
        break
      default:
        break
    }
  }
  return about
}

const isAbout = (
  operation: EntityOperation,
  personId: EntityId,
  about: EntitiesAbout
): boolean => {
  switch (operation.type) {
    case 'person.create':
    case 'person.remove':
      return operation.person.id === personId
    case 'person.update':
    case 'person.bin':
    case 'person.restore':
      return operation.personId === personId
    case 'union.create':
    case 'union.remove':
      return about.unions.has(operation.union.id)
    case 'union.update':
      return about.unions.has(operation.unionId)
    case 'filiation.create':
    case 'filiation.remove':
      return about.filiations.has(operation.filiation.id)
    case 'filiation.update':
      return about.filiations.has(operation.filiationId)
    case 'event.create':
    case 'event.remove':
      return about.events.has(operation.event.id)
    case 'event.update':
      return about.events.has(operation.eventId)
    case 'photo.create':
    case 'photo.remove':
      return about.photos.has(operation.photo.id)
    case 'photo.update':
      return about.photos.has(operation.photoId)
  }
}

/** The operation without what concerns the person: `null` when nothing is left, a group keeping only its other parts. */
const withoutPerson = (
  operation: Operation,
  isErased: (operation: EntityOperation) => boolean
): Operation | null => {
  if (operation.type !== 'group') {
    return isErased(operation) ? null : operation
  }
  const kept = operation.operations.flatMap(
    (part) => withoutPerson(part, isErased) ?? []
  )
  return kept.length === 0 ? null : { operations: kept, type: 'group' }
}

/** An undo still names the entries it took back, minus those erased; one that names none left reads as a plain edit. */
const causeWithout = (
  cause: EntryCause | null,
  erasedRevisions: ReadonlySet<number>
): EntryCause | null => {
  if (cause?.kind !== 'undo') return cause
  const revisions = cause.revisions.filter(
    (revision) => !erasedRevisions.has(revision)
  )
  return revisions.length === 0 ? null : { kind: 'undo', revisions }
}

/**
 * Takes a person out of the whole log, as if they had never been entered:
 * every operation on them or on what is about them goes, an entry left with
 * nothing goes too, and what they signed is signed by `ERASED_AUTHOR`.
 * Revisions keep their numbers. Their name typed as free text in someone
 * else's notes or captions stays: no rule can tell it apart.
 */
export const erasePersonFromLog = ({
  log,
  personId
}: {
  log: readonly ChangeLogEntry[]
  personId: EntityId
}): Result<LogErasure, 'person_not_found'> => {
  const operations = log.flatMap((entry) => entityOperationsOf(entry.operation))
  const about = entitiesAbout(operations, personId)
  const isErased = (operation: EntityOperation) =>
    isAbout(operation, personId, about)
  if (
    !operations.some(
      (operation) => operation.type === 'person.create' && isErased(operation)
    )
  ) {
    return Result.failure('person_not_found')
  }

  const kept = log.flatMap((entry) => {
    const operation = withoutPerson(entry.operation, isErased)
    return operation === null ? [] : [{ ...entry, operation }]
  })
  const keptRevisions = new Set(kept.map((entry) => entry.revision))
  const erasedRevisions = new Set(
    log
      .map((entry) => entry.revision)
      .filter((revision) => !keptRevisions.has(revision))
  )
  const entries = kept.map((entry) => ({
    ...entry,
    author:
      entry.author.kind === 'person' && entry.author.personId === personId
        ? ERASED_AUTHOR
        : entry.author,
    cause: causeWithout(entry.cause, erasedRevisions)
  }))
  return Result.success({ entries, photoIds: about.photos })
}
