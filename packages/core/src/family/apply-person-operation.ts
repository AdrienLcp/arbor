import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { withEntry, withMember, withoutEntry, withoutMember } from './copy-with'
import type { FamilyState } from './family-state'

export type PersonOperation = Extract<Operation, { type: `person.${string}` }>

const requireExistingPortrait = (
  family: FamilyState,
  portraitPhotoId: EntityId | null | undefined
): Result<void, 'photo_not_found'> =>
  portraitPhotoId == null || family.photos.has(portraitPhotoId)
    ? Result.success()
    : Result.failure('photo_not_found')

const isLinked = (family: FamilyState, personId: EntityId) =>
  family.unions
    .values()
    .some(({ partnerIds }) => partnerIds.includes(personId)) ||
  family.filiations
    .values()
    .some(
      ({ childId, parentId }) => childId === personId || parentId === personId
    ) ||
  family.events.values().some((event) => event.personId === personId) ||
  family.photos.values().some((photo) => photo.personId === personId)

export const applyPersonOperation = (
  family: FamilyState,
  operation: PersonOperation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'person.create': {
      const { person } = operation
      if (family.persons.has(person.id)) return Result.failure('person_exists')
      const portrait = requireExistingPortrait(family, person.portraitPhotoId)
      if (portrait.status === 'failure') return portrait
      return Result.success({
        ...family,
        persons: withEntry(family.persons, person.id, person)
      })
    }
    case 'person.update': {
      const person = family.persons.get(operation.personId)
      if (!person) return Result.failure('person_not_found')
      if (family.binnedPersonIds.has(person.id)) {
        return Result.failure('person_binned')
      }
      const portrait = requireExistingPortrait(
        family,
        operation.after.portraitPhotoId
      )
      if (portrait.status === 'failure') return portrait
      return Result.success({
        ...family,
        persons: withEntry(family.persons, person.id, {
          ...person,
          ...operation.after
        })
      })
    }
    case 'person.bin': {
      if (!family.persons.has(operation.personId)) {
        return Result.failure('person_not_found')
      }
      if (family.binnedPersonIds.has(operation.personId)) {
        return Result.failure('person_binned')
      }
      return Result.success({
        ...family,
        binnedPersonIds: withMember(family.binnedPersonIds, operation.personId)
      })
    }
    case 'person.restore': {
      if (!family.binnedPersonIds.has(operation.personId)) {
        return Result.failure('person_not_binned')
      }
      return Result.success({
        ...family,
        binnedPersonIds: withoutMember(
          family.binnedPersonIds,
          operation.personId
        )
      })
    }
    case 'person.remove': {
      const personId = operation.person.id
      if (!family.persons.has(personId))
        return Result.failure('person_not_found')
      if (family.binnedPersonIds.has(personId)) {
        return Result.failure('person_binned')
      }
      if (isLinked(family, personId)) return Result.failure('person_linked')
      return Result.success({
        ...family,
        persons: withoutEntry(family.persons, personId)
      })
    }
  }
}
