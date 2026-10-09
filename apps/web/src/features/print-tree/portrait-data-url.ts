/** Pixels per unit of the art's ratio: enough for a sticker printed the size of a photo. */
const PIXELS_PER_UNIT = 4
const JPEG_QUALITY = 0.86

/**
 * A photo cropped to fill a box of `size`, centred, as a JPEG data URL. The
 * PDF maker embeds images only from data URLs and reads JPEG and PNG, not the
 * WebP a phone may have uploaded; `null` when the image cannot be decoded.
 */
export const portraitDataUrl = async ({
  image,
  size
}: {
  image: Blob
  size: { height: number; width: number }
}): Promise<string | null> => {
  const bitmap = await createImageBitmap(image).catch(() => null)
  if (bitmap === null) return null
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(size.width * PIXELS_PER_UNIT)
  canvas.height = Math.round(size.height * PIXELS_PER_UNIT)
  const context = canvas.getContext('2d')
  if (context === null) return null
  const cover = Math.max(
    canvas.width / bitmap.width,
    canvas.height / bitmap.height
  )
  const width = bitmap.width * cover
  const height = bitmap.height * cover
  context.drawImage(
    bitmap,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  )
  bitmap.close()
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
