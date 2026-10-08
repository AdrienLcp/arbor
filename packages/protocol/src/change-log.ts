import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { operationSchema } from './operation.ts'
import { NAME_MAX_LENGTH } from './person.ts'

/** Who the visitor said they are on "Who are you in this tree?": a person of the tree, or a name typed by someone not in it yet. */
export const authorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('person'), personId: entityIdSchema }),
  z.object({
    kind: z.literal('named'),
    name: z.string().min(1).max(NAME_MAX_LENGTH)
  })
])
export type Author = z.infer<typeof authorSchema>

/** One line of a family's change log, the source of truth its current state is replayed from. */
export const changeLogEntrySchema = z.object({
  at: z.iso.datetime({ offset: true }),
  author: authorSchema,
  operation: operationSchema,
  revision: z.int().min(1)
})
export type ChangeLogEntry = z.infer<typeof changeLogEntrySchema>
