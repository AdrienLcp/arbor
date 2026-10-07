import { z } from 'zod'

import { PHOTO_CONTENT_TYPES, PHOTO_VARIANTS } from '@arbor/protocol/photo-file'

import type { SqlDatabase } from '@/infrastructure/durable-objects/sql-database'

import type { PhotoStore } from './photo-store'

const fileRowSchema = z.object({
  bytes: z.instanceof(Uint8Array),
  content_type: z.enum(PHOTO_CONTENT_TYPES),
  variant: z.enum(PHOTO_VARIANTS)
})

/** The family's `PhotoStore` over its Durable Object's SQLite storage: one row per image, under the 2 MB a value may hold. */
export const createSqlPhotoStore = (database: SqlDatabase): PhotoStore => ({
  hasFiles: (photoId) =>
    database.exec(
      'SELECT 1 FROM photo_files WHERE photo_id = ? LIMIT 1',
      photoId
    ).length > 0,
  readFile: ({ id, variant }) => {
    const row = database
      .exec(
        'SELECT variant, content_type, bytes FROM photo_files WHERE photo_id = ? AND variant = ?',
        id,
        variant
      )
      .at(0)
    if (row === undefined) return null
    const stored = fileRowSchema.parse(row)
    return {
      bytes: stored.bytes,
      contentType: stored.content_type,
      variant: stored.variant
    }
  },
  writeFiles: ({ files, id }) => {
    for (const file of files) {
      database.exec(
        'INSERT INTO photo_files (photo_id, variant, content_type, bytes) VALUES (?, ?, ?, ?)',
        id,
        file.variant,
        file.contentType,
        file.bytes
      )
    }
  }
})
