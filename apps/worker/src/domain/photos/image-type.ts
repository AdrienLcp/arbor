import type { PhotoContentType } from '@arbor/protocol/photo-file'

const startsWith = (bytes: Uint8Array, signature: readonly number[], at = 0) =>
  signature.every((byte, index) => bytes[at + index] === byte)

const asciiCodes = (text: string) =>
  [...text].map((letter) => letter.charCodeAt(0))

/**
 * The image type the bytes themselves say, whatever the upload claimed: the
 * file is served back under this type, so it must be what the browser will
 * decode, and nothing else gets stored.
 */
export const imageTypeOf = (bytes: Uint8Array): PhotoContentType | null => {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (startsWith(bytes, [0x89, ...asciiCodes('PNG'), 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png'
  }
  if (
    startsWith(bytes, asciiCodes('RIFF')) &&
    startsWith(bytes, asciiCodes('WEBP'), 8)
  ) {
    return 'image/webp'
  }
  return null
}
