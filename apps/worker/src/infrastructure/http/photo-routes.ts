import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { entityIdSchema } from '@arbor/protocol/entity-id'
import {
  PHOTO_FILE_MAX_BYTES,
  PHOTO_VARIANTS,
  type PhotoVariant
} from '@arbor/protocol/photo-file'
import { API_ROUTES } from '@arbor/protocol/routes'

import { readPhotoFile, storePhotoFiles } from '@/domain/photos/photo-service'

import { admitted } from './admission'
import { apiError, apiJson } from './api-response'
import { invalidInput } from './invalid-input'
import { type RoomApp, viewerOf } from './room-context'

const variantSchema = z.enum(PHOTO_VARIANTS)

const uploadFileSchema = z.instanceof(File)

/** Both sizes of a photo, sent as one form. */
const uploadFormSchema = z.object({
  full: uploadFileSchema,
  thumbnail: uploadFileSchema
} satisfies Record<PhotoVariant, typeof uploadFileSchema>)

/** A photo's images never change once stored, so the browser may keep them as long as it likes, for this key only. */
const PHOTO_FILE_HEADERS = {
  'Cache-Control': 'private, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff'
}

const isWithinSizeLimit = (file: File) => file.size <= PHOTO_FILE_MAX_BYTES

/** A photo's images: uploaded once, in both sizes, after the log holds the photo. */
export const registerPhotoRoutes = (app: RoomApp) => {
  app.post(
    API_ROUTES.photo,
    admitted('contributor'),
    zValidator('form', uploadFormSchema, invalidInput),
    async (context) => {
      const photoId = entityIdSchema.safeParse(context.req.param('photoId'))
      if (!photoId.success) return apiError('not_found', 'No such photo')

      const { full, thumbnail } = context.req.valid('form')
      if (!(isWithinSizeLimit(full) && isWithinSizeLimit(thumbnail))) {
        return apiError('photo_too_large', 'A file is over the size limit')
      }
      const uploads = {
        full: new Uint8Array(await full.arrayBuffer()),
        thumbnail: new Uint8Array(await thumbnail.arrayBuffer())
      }

      const { stores } = context.var
      const stored = stores.transaction(() =>
        storePhotoFiles({
          family: stores.family.readFamily(),
          photoId: photoId.data,
          store: stores.photos,
          uploads
        })
      )
      return stored.status === 'failure'
        ? apiError(stored.error, 'The photo files were not stored')
        : apiJson({ id: photoId.data }, 201)
    }
  )

  app.get(API_ROUTES.photoFile, admitted('reader'), (context) => {
    const photoId = entityIdSchema.safeParse(context.req.param('photoId'))
    const variant = variantSchema.safeParse(context.req.param('variant'))
    if (!photoId.success || !variant.success) {
      return apiError('not_found', 'No such photo')
    }

    const { stores } = context.var
    const file = readPhotoFile({
      family: stores.family.readFamily(),
      photoId: photoId.data,
      store: stores.photos,
      variant: variant.data,
      viewer: viewerOf(context.var)
    })
    if (file.status === 'failure') {
      return apiError(file.error, 'No such photo')
    }
    return new Response(file.data.bytes, {
      headers: {
        ...PHOTO_FILE_HEADERS,
        'Content-Type': file.data.contentType
      }
    })
  })
}
