import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { occurrenceSchema } from './occurrence.ts'

const LABEL_MAX_LENGTH = 200

export const LIFE_EVENT_KINDS = ['baptism', 'burial', 'other'] as const

/**
 * Something that happened to a person besides being born and dying, which are
 * on the person, and marrying or divorcing, which are on the union.
 */
export const lifeEventSchema = occurrenceSchema.extend({
  id: entityIdSchema,
  kind: z.enum(LIFE_EVENT_KINDS),
  /** What happened, for an `other` event. */
  label: z.string().max(LABEL_MAX_LENGTH).nullable(),
  personId: entityIdSchema
})
export type LifeEvent = z.infer<typeof lifeEventSchema>

/** What an edit may change on a life event: it stays with its person. */
export const lifeEventFieldsSchema = lifeEventSchema
  .pick({ date: true, kind: true, label: true, place: true })
  .partial()
export type LifeEventFields = z.infer<typeof lifeEventFieldsSchema>
