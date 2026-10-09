import { useEffect, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { PhotoVariant } from '@arbor/protocol/photo-file'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import {
  type FamilyAccess,
  fetchPhotoFile
} from '@/infrastructure/api/family-api'

/**
 * A photo's images never change once stored, so each is fetched once per
 * page life and its blob address shared by every sticker that shows it.
 * A failed fetch is forgotten, to be tried again on the next showing.
 */
const loadedUrls = new Map<string, Promise<string | null>>()

const loadPhotoUrl = (
  access: FamilyAccess,
  photoId: EntityId,
  variant: PhotoVariant
): Promise<string | null> => {
  const cacheKey = [access.familyId, access.key, photoId, variant].join('/')
  const known = loadedUrls.get(cacheKey)
  if (known !== undefined) return known

  const loading = fetchPhotoFile({ ...access, photoId, variant }).then(
    (file) => {
      if (file.status === 'success') return URL.createObjectURL(file.data)
      loadedUrls.delete(cacheKey)
      return null
    }
  )
  loadedUrls.set(cacheKey, loading)
  return loading
}

/** The address an `<img>` shows a photo's image from; `null` while it loads, or when there is none to show. */
export const usePhotoUrl = (
  photoId: EntityId | null,
  variant: PhotoVariant
): string | null => {
  const { familyId, key } = useOpenFamily()
  const [loaded, setLoaded] = useState<{ id: string; url: string } | null>(null)

  useEffect(() => {
    if (photoId === null) return
    let isShowing = true
    void loadPhotoUrl({ familyId, key }, photoId, variant).then((url) => {
      if (isShowing && url !== null) setLoaded({ id: photoId, url })
    })
    return () => {
      isShowing = false
    }
  }, [familyId, key, photoId, variant])

  return loaded !== null && loaded.id === photoId ? loaded.url : null
}
