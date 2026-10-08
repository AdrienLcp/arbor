import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { usePhotoUrl } from './use-photo-url'

type PortraitImageProps = {
  photoId: EntityId | null
}

/** A person's portrait laid over the monogram on their sticker's art, once its thumbnail has arrived. */
export const PortraitImage: React.FC<PortraitImageProps> = ({ photoId }) => {
  const url = usePhotoUrl(photoId, 'thumbnail')
  return url === null ? null : (
    <img alt='' className='sticker-portrait' draggable={false} src={url} />
  )
}
