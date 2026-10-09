import type { EntityId } from '@arbor/protocol/entity-id'
import type { PhotoVariant } from '@arbor/protocol/photo-file'

import {
  DEMO_FAMILY_AUTHOR,
  DEMO_FAMILY_NAME,
  DEMO_FAMILY_OPERATIONS
} from '@arbor/core/family/demo-family'

import type { MintedKey } from '@/domain/access/access-service'
import type { AccessStore } from '@/domain/access/access-store'
import { openFamily, recordOperations } from '@/domain/family/family-service'
import type { FamilyStore } from '@/domain/family/family-store'
import { storePhotoFiles } from '@/domain/photos/photo-service'
import type { PhotoStore } from '@/domain/photos/photo-store'

/** The images behind the demo family's photo records, by photo id. */
export type DemoPhotoFiles = Readonly<
  Record<EntityId, Readonly<Record<PhotoVariant, Uint8Array>>>
>

/**
 * Builds the demo family in an empty object: its change log replayed from the
 * fixture, its photos' images stored. The fixture is ours, so a refusal along
 * the way is a bug in it.
 */
export const openDemoFamily = ({
  access,
  at,
  familyKey,
  keeperKey,
  photoFiles,
  photos,
  store
}: {
  access: AccessStore
  at: string
  familyKey: MintedKey
  keeperKey: MintedKey
  photoFiles: DemoPhotoFiles
  photos: PhotoStore
  store: FamilyStore
}): void => {
  const opened = openFamily({
    access,
    at,
    familyKey,
    input: { name: DEMO_FAMILY_NAME },
    keeperKey,
    store
  })
  if (opened.status === 'failure') {
    throw new Error(`The demo family could not open: ${opened.error}`)
  }

  for (const operation of DEMO_FAMILY_OPERATIONS) {
    const recorded = recordOperations({
      at,
      input: {
        author: DEMO_FAMILY_AUTHOR,
        baseRevision: store.readRevision(),
        operations: [operation]
      },
      store
    })
    if (recorded.status === 'failure') {
      throw new Error(`The demo family refused its fixture: ${recorded.error}`)
    }
  }

  for (const [photoId, uploads] of Object.entries(photoFiles)) {
    const stored = storePhotoFiles({
      family: store.readFamily(),
      photoId,
      store: photos,
      uploads
    })
    if (stored.status === 'failure') {
      throw new Error(`The demo photo ${photoId} was refused: ${stored.error}`)
    }
  }
}
