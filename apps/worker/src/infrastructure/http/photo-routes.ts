import { z } from 'zod'

import { entityIdSchema } from '@arbor/protocol/entity-id'
import {
  PHOTO_FILE_MAX_BYTES,
  PHOTO_VARIANTS,
  type PhotoVariant
} from '@arbor/protocol/photo-file'
import { API_ROUTES } from '@arbor/protocol/routes'

import { readPhotoFile, storePhotoFiles } from '@/domain/photos/photo-service'

import { apiError, apiJson } from './api-response'
import { readFormBody } from './request-body'
import { type RoomRoute, viewerOf } from './room-request'

const variantSchema = z.enum(PHOTO_VARIANTS)

/** A photo's images never change once stored, so the browser may keep them as long as it likes, for this key only. */
const PHOTO_FILE_HEADERS = {
  'Cache-Control': 'private, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff'
}

type UploadReading =
  | { status: 'read'; uploads: Record<PhotoVariant, Uint8Array> }
  | { status: 'missing' }
  | { status: 'too_large' }

/** Each variant's file from the form, its size checked before its bytes are read. */
const readUploads = async (form: FormData): Promise<UploadReading> => {
  const files = PHOTO_VARIANTS.map((variant) => ({
    file: form.get(variant),
    variant
  }))
  const uploads: Partial<Record<PhotoVariant, Uint8Array>> = {}
  for (const { file, variant } of files) {
    if (!(file instanceof File)) return { status: 'missing' }
    if (file.size > PHOTO_FILE_MAX_BYTES) return { status: 'too_large' }
    uploads[variant] = new Uint8Array(await file.arrayBuffer())
  }
  const { full, thumbnail } = uploads
  return full === undefined || thumbnail === undefined
    ? { status: 'missing' }
    : { status: 'read', uploads: { full, thumbnail } }
}

/** A photo's images: uploaded once, in both sizes, after the log holds the photo. */
export const PHOTO_ROUTES: readonly RoomRoute[] = [
  {
    handle: async ({ parameters, request, stores }) => {
      const photoId = entityIdSchema.safeParse(parameters.photoId)
      if (!photoId.success) return apiError('not_found', 'No such photo')

      const form = await readFormBody(request)
      if (form === null) return apiError('invalid_input', 'Expected a form')
      const reading = await readUploads(form)
      if (reading.status === 'missing') {
        return apiError(
          'invalid_input',
          `Expected ${PHOTO_VARIANTS.join(' and ')} files`
        )
      }
      if (reading.status === 'too_large') {
        return apiError('photo_too_large', 'A file is over the size limit')
      }

      const stored = stores.transaction(() =>
        storePhotoFiles({
          family: stores.family.readFamily(),
          photoId: photoId.data,
          store: stores.photos,
          uploads: reading.uploads
        })
      )
      return stored.status === 'failure'
        ? apiError(stored.error, 'The photo files were not stored')
        : apiJson({ id: photoId.data }, 201)
    },
    method: 'POST',
    needs: 'contributor',
    pattern: API_ROUTES.photo
  },
  {
    handle: (roomRequest) => {
      const { parameters, stores } = roomRequest
      const photoId = entityIdSchema.safeParse(parameters.photoId)
      const variant = variantSchema.safeParse(parameters.variant)
      if (!photoId.success || !variant.success) {
        return apiError('not_found', 'No such photo')
      }

      const file = readPhotoFile({
        family: stores.family.readFamily(),
        photoId: photoId.data,
        store: stores.photos,
        variant: variant.data,
        viewer: viewerOf(roomRequest)
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
    },
    method: 'GET',
    needs: 'reader',
    pattern: API_ROUTES.photoFile
  }
]
