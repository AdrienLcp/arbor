import { z } from 'zod'

import { fuzzyDateSchema } from './fuzzy-date.ts'

const PLACE_MAX_LENGTH = 300

/** When and where something happened; either may be unknown. */
export const occurrenceSchema = z.object({
  date: fuzzyDateSchema.nullable(),
  place: z.string().max(PLACE_MAX_LENGTH).nullable()
})
export type Occurrence = z.infer<typeof occurrenceSchema>
