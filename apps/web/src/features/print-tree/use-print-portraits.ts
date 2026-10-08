import { useEffect, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { fetchPhotoFile } from '@/infrastructure/api/family-api'

import { portraitDataUrl } from './portrait-data-url'
import { STICKER_ART } from './sticker-art'

/**
 * The portraits a printed sheet embeds, as data URLs cropped to the sticker's
 * art, by photo id. Filled as they arrive; a portrait that fails to load is
 * left out and its sticker keeps its monogram.
 */
export const usePrintPortraits = (
  photoIds: readonly EntityId[]
): ReadonlyMap<EntityId, string> => {
  const { familyId, key } = useOpenFamily()
  const [portraits, setPortraits] = useState<ReadonlyMap<EntityId, string>>(
    new Map()
  )
  const wanted = [...new Set(photoIds)].sort().join(' ')

  useEffect(() => {
    if (wanted === '') return
    const controller = new AbortController()
    for (const photoId of wanted.split(' ')) {
      void fetchPhotoFile({
        familyId,
        key,
        photoId,
        signal: controller.signal,
        variant: 'thumbnail'
      })
        .then((file) =>
          file.status === 'success'
            ? portraitDataUrl({ image: file.data, size: STICKER_ART })
            : null
        )
        .then((url) => {
          if (url === null || controller.signal.aborted) return
          setPortraits((known) => new Map(known).set(photoId, url))
        })
    }
    return () => controller.abort()
  }, [familyId, key, wanted])

  return portraits
}
