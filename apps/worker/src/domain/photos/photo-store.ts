import type { EntityId } from '@arbor/protocol/entity-id'
import type { PhotoContentType, PhotoVariant } from '@arbor/protocol/photo-file'

/** One stored image of a photo. */
export type PhotoFile = {
  bytes: Uint8Array
  contentType: PhotoContentType
  variant: PhotoVariant
}

/** The images behind the family's photos; their metadata lives in the change log. */
export type PhotoStore = {
  hasFiles: (photoId: EntityId) => boolean
  readFile: (photo: { id: EntityId; variant: PhotoVariant }) => PhotoFile | null
  writeFiles: (photo: { files: readonly PhotoFile[]; id: EntityId }) => void
}
