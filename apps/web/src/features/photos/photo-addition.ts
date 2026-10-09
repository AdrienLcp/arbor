import type { EntityId } from '@arbor/protocol/entity-id'
import type { EntityOperation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'
import type { Photo } from '@arbor/protocol/photo'

/** A photo given to a person, and whether it becomes the face on their sticker. */
export type PhotoAddition = {
  asPortrait: boolean
  person: Person
  photo: Photo
}

const portraitSwap = (
  person: Person,
  from: EntityId | null,
  to: EntityId | null
): EntityOperation => ({
  after: { portraitPhotoId: to },
  before: { portraitPhotoId: from },
  personId: person.id,
  type: 'person.update'
})

/** Makes a photo the face on a person's sticker; `null` when it already is. */
export const portraitOperation = (
  person: Person,
  photoId: EntityId
): EntityOperation | null =>
  person.portraitPhotoId === photoId
    ? null
    : portraitSwap(person, person.portraitPhotoId, photoId)

/** The changes that record a new photo: the photo first, so the portrait can point at it. */
export const photoAdditionOperations = ({
  asPortrait,
  person,
  photo
}: PhotoAddition): EntityOperation[] => {
  const portrait = asPortrait ? portraitOperation(person, photo.id) : null
  return [
    { photo, type: 'photo.create' },
    ...(portrait === null ? [] : [portrait])
  ]
}

/**
 * The changes that take a recorded photo back when its images never
 * arrived: the portrait goes back first, since a portrait cannot be removed.
 * `person` is as it was before the addition.
 */
export const photoWithdrawalOperations = ({
  asPortrait,
  person,
  photo
}: PhotoAddition): EntityOperation[] => [
  ...(asPortrait && person.portraitPhotoId !== photo.id
    ? [portraitSwap(person, photo.id, person.portraitPhotoId)]
    : []),
  { photo, type: 'photo.remove' }
]
