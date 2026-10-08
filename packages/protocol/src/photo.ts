import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { fuzzyDateSchema } from './fuzzy-date.ts'

const CAPTION_MAX_LENGTH = 1000

/** A photo's metadata; the image and its thumbnail are stored apart under its id. */
export const photoSchema = z.object({
  caption: z.string().max(CAPTION_MAX_LENGTH),
  date: fuzzyDateSchema.nullable(),
  id: entityIdSchema,
  /** The person the photo belongs to, `null` for a group or a place. */
  personId: entityIdSchema.nullable()
})
export type Photo = z.infer<typeof photoSchema>

export const photoFieldsSchema = photoSchema.omit({ id: true }).partial()
export type PhotoFields = z.infer<typeof photoFieldsSchema>
