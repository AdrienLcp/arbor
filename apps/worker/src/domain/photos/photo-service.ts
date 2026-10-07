import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import {
  PHOTO_FILE_MAX_BYTES,
  PHOTO_VARIANTS,
  type PhotoVariant
} from '@arbor/protocol/photo-file'

import type { FamilyState } from '@arbor/core/family/family-state'

import { isPhotoVisibleTo, type Viewer } from '@/domain/family/family-view'

import { imageTypeOf } from './image-type'
import type { PhotoFile, PhotoStore } from './photo-store'

export type PhotoUploadRefusal =
  | 'photo_file_exists'
  | 'photo_not_found'
  | 'photo_too_large'
  | 'unsupported_image'

/**
 * Stores the images of a photo the log already holds, both at once. A photo's
 * images are never replaced: a different picture is a different photo.
 */
export const storePhotoFiles = ({
  family,
  photoId,
  store,
  uploads
}: {
  family: FamilyState
  photoId: EntityId
  store: PhotoStore
  uploads: Readonly<Record<PhotoVariant, Uint8Array>>
}): Result<void, PhotoUploadRefusal> => {
  if (!family.photos.has(photoId)) return Result.failure('photo_not_found')
  if (store.hasFiles(photoId)) return Result.failure('photo_file_exists')

  const files: PhotoFile[] = []
  for (const variant of PHOTO_VARIANTS) {
    const bytes = uploads[variant]
    if (bytes.byteLength > PHOTO_FILE_MAX_BYTES) {
      return Result.failure('photo_too_large')
    }
    const contentType = imageTypeOf(bytes)
    if (contentType === null) return Result.failure('unsupported_image')
    files.push({ bytes, contentType, variant })
  }

  store.writeFiles({ files, id: photoId })
  return Result.success()
}

/** One image of a photo, for a viewer allowed to see it; any other case looks like a missing photo. */
export const readPhotoFile = ({
  family,
  photoId,
  store,
  variant,
  viewer
}: {
  family: FamilyState
  photoId: EntityId
  store: PhotoStore
  variant: PhotoVariant
  viewer: Viewer
}): Result<PhotoFile, 'not_found'> => {
  if (!isPhotoVisibleTo({ family, photoId, viewer })) {
    return Result.failure('not_found')
  }
  const file = store.readFile({ id: photoId, variant })
  return file === null ? Result.failure('not_found') : Result.success(file)
}
