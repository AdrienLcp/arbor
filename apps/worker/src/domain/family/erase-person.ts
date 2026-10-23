import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { ErasedPerson } from '@arbor/protocol/routes'

import { replayOperations } from '@arbor/core/family/replay-operations'

import type { PhotoStore } from '@/domain/photos/photo-store'

import { erasePersonFromLog } from './erase-person-from-log'
import type { FamilyStore } from './family-store'

export type ErasureRefusal = 'erasure_breaks_replay' | 'person_not_found'

/**
 * Erases one person for good, on the publisher's request: the log is
 * rewritten without them, the state rebuilt from it, and their photos' files
 * deleted. The one write the change log does not record, and the one no undo
 * brings back. Runs inside the object's transaction.
 */
export const erasePerson = ({
  personId,
  photos,
  store
}: {
  personId: EntityId
  photos: PhotoStore
  store: FamilyStore
}): Result<ErasedPerson, ErasureRefusal> => {
  const log = store.readLog({ after: 0 })
  const erasure = erasePersonFromLog({ log, personId })
  if (erasure.status === 'failure') return erasure

  const { entries, photoIds } = erasure.data
  const family = replayOperations(entries.map((entry) => entry.operation))
  if (family.status === 'failure') {
    return Result.failure('erasure_breaks_replay')
  }

  for (const photoId of photoIds) photos.removeFiles(photoId)
  store.rewriteLog({ entries, family: family.data })
  return Result.success({
    removedEntries: log.length - entries.length,
    removedPhotos: photoIds.size
  })
}
