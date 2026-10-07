import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { requireActivePersonIfAny } from './active-person'
import { withEntry, withoutEntry } from './copy-with'
import type { FamilyState } from './family-state'

export type PhotoOperation = Extract<Operation, { type: `photo.${string}` }>

const isSomeonesPortrait = (family: FamilyState, photoId: EntityId) =>
  family.persons.values().some((person) => person.portraitPhotoId === photoId)

export const applyPhotoOperation = (
  family: FamilyState,
  operation: PhotoOperation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'photo.create': {
      const { photo } = operation
      if (family.photos.has(photo.id)) return Result.failure('photo_exists')
      const owner = requireActivePersonIfAny(family, photo.personId)
      if (owner.status === 'failure') return owner
      return Result.success({
        ...family,
        photos: withEntry(family.photos, photo.id, photo)
      })
    }
    case 'photo.update': {
      const photo = family.photos.get(operation.photoId)
      if (!photo) return Result.failure('photo_not_found')
      if (operation.after.personId !== undefined) {
        const owner = requireActivePersonIfAny(family, operation.after.personId)
        if (owner.status === 'failure') return owner
      }
      return Result.success({
        ...family,
        photos: withEntry(family.photos, photo.id, {
          ...photo,
          ...operation.after
        })
      })
    }
    case 'photo.remove': {
      if (!family.photos.has(operation.photo.id)) {
        return Result.failure('photo_not_found')
      }
      if (isSomeonesPortrait(family, operation.photo.id)) {
        return Result.failure('photo_is_portrait')
      }
      return Result.success({
        ...family,
        photos: withoutEntry(family.photos, operation.photo.id)
      })
    }
  }
}
