import { z } from 'zod'

import { entityIdSchema } from './entity-id'

export const FILIATION_KINDS = [
  'birth',
  'adoption',
  'step',
  'foster',
  'unknown'
] as const
export type FiliationKind = (typeof FILIATION_KINDS)[number]

/**
 * One child, one parent. A child of a couple has two filiations, a child of a
 * single known parent one; half-siblings are those sharing a single parent.
 */
export const filiationSchema = z.object({
  childId: entityIdSchema,
  id: entityIdSchema,
  kind: z.enum(FILIATION_KINDS),
  parentId: entityIdSchema
})
export type Filiation = z.infer<typeof filiationSchema>

/** What an edit may change on a filiation: its child and parent are fixed. */
export const filiationFieldsSchema = filiationSchema
  .pick({ kind: true })
  .partial()
export type FiliationFields = z.infer<typeof filiationFieldsSchema>
