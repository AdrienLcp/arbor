/** A photo is stored twice: the image shown on its own, and the small one lists and the tree show. */
export const PHOTO_VARIANTS = ['full', 'thumbnail'] as const
export type PhotoVariant = (typeof PHOTO_VARIANTS)[number]

/** The browser resizes before uploading; anything above this is refused rather than stored. */
export const PHOTO_FILE_MAX_BYTES = 1024 * 1024

export const PHOTO_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const
export type PhotoContentType = (typeof PHOTO_CONTENT_TYPES)[number]
