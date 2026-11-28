import { Result } from '@adrienlcp/result'

import {
  PHOTO_FILE_MAX_BYTES,
  type PhotoVariant
} from '@arbor/protocol/photo-file'

/** The long side of each stored image, in pixels (`docs/architecture.md`, the storage budget). */
const LONG_SIDES: Record<PhotoVariant, number> = {
  full: 1600,
  thumbnail: 320
}
const WEBP_QUALITY = 0.8
const JPEG_QUALITY = 0.85

/** Why a picked file cannot become a photo: it is not an image the browser reads, or it stays too heavy once resized. */
export type PhotoResizeFailure = 'too_large' | 'unreadable'

export type ResizedPhoto = Readonly<Record<PhotoVariant, Blob>>

/** The part of a picture kept: its left, top, width and height, each a share of the upright picture's width or height, from 0 to 1. */
export type PhotoCrop = Readonly<{
  height: number
  width: number
  x: number
  y: number
}>

export const WHOLE_PHOTO: PhotoCrop = { height: 1, width: 1, x: 0, y: 0 }

/** Below this share of a side left out, a crop is the whole picture: a frame dragged back to the edge rarely lands on it exactly. */
const UNCROPPED_SHARE = 0.005

export const isWholePhoto = ({ height, width }: PhotoCrop): boolean =>
  width >= 1 - UNCROPPED_SHARE && height >= 1 - UNCROPPED_SHARE

const encode = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality))

/** WebP where the browser can write it; Safari hands back a PNG instead, far heavier, so JPEG then. */
const encodeCompact = async (
  canvas: HTMLCanvasElement
): Promise<Blob | null> => {
  const webp = await encode(canvas, 'image/webp', WEBP_QUALITY)
  return webp?.type === 'image/webp'
    ? webp
    : encode(canvas, 'image/jpeg', JPEG_QUALITY)
}

const drawScaled = (
  image: ImageBitmap,
  crop: PhotoCrop,
  longSide: number
): HTMLCanvasElement | null => {
  const sourceX = crop.x * image.width
  const sourceY = crop.y * image.height
  const sourceWidth = Math.max(1, crop.width * image.width)
  const sourceHeight = Math.max(1, crop.height * image.height)
  const scale = Math.min(1, longSide / Math.max(sourceWidth, sourceHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const context = canvas.getContext('2d')
  if (context === null) return null
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  )
  return canvas
}

const resizedVariant = async (
  image: ImageBitmap,
  crop: PhotoCrop,
  variant: PhotoVariant
): Promise<Result<Blob, PhotoResizeFailure>> => {
  const canvas = drawScaled(image, crop, LONG_SIDES[variant])
  const blob = canvas === null ? null : await encodeCompact(canvas)
  if (blob === null) return Result.failure('unreadable')
  return blob.size > PHOTO_FILE_MAX_BYTES
    ? Result.failure('too_large')
    : Result.success(blob)
}

/** A picked picture made light enough to keep: upright, cut to its crop, at most 1600 px, and its 320 px thumbnail. */
export const resizePhoto = async (
  file: Blob,
  crop: PhotoCrop = WHOLE_PHOTO
): Promise<Result<ResizedPhoto, PhotoResizeFailure>> => {
  const image = await createImageBitmap(file, {
    imageOrientation: 'from-image'
  }).catch(() => null)
  if (image === null) return Result.failure('unreadable')

  const full = await resizedVariant(image, crop, 'full')
  const thumbnail = await resizedVariant(image, crop, 'thumbnail')
  image.close()
  if (full.status === 'failure') return full
  if (thumbnail.status === 'failure') return thumbnail
  return Result.success({ full: full.data, thumbnail: thumbnail.data })
}
