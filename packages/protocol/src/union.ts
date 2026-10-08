import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { occurrenceSchema } from './occurrence.ts'

export const UNION_KINDS = [
  'marriage',
  'pacs',
  'partnership',
  'unknown'
] as const
export const UNION_ENDINGS = ['divorce', 'separation'] as const

export const unionEndSchema = occurrenceSchema.extend({
  kind: z.enum(UNION_ENDINGS)
})

/** A couple. A partner's death ends it implicitly, so `end` only records a divorce or a separation. */
export const unionSchema = z.object({
  end: unionEndSchema.nullable(),
  id: entityIdSchema,
  kind: z.enum(UNION_KINDS),
  /** The second partner is `null` when unknown. */
  partnerIds: z.tuple([entityIdSchema, entityIdSchema.nullable()]),
  start: occurrenceSchema.nullable()
})
export type Union = z.infer<typeof unionSchema>

/** What an edit may change on a union: its partners are fixed for its whole life. */
export const unionFieldsSchema = unionSchema
  .pick({ end: true, kind: true, start: true })
  .partial()
export type UnionFields = z.infer<typeof unionFieldsSchema>
