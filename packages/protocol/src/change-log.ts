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

const revisionSchema = z.int().min(1)

/**
 * Why the server wrote an entry itself: it takes back earlier entries — the
 * ones listed, or every entry after a past revision for a keeper's restore.
 */
export const entryCauseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('undo'),
    revisions: z.array(revisionSchema).min(1)
  }),
  z.object({ kind: z.literal('restore'), revision: z.int().min(0) })
])
export type EntryCause = z.infer<typeof entryCauseSchema>

/** One line of a family's change log, the source of truth its current state is replayed from. */
export const changeLogEntrySchema = z.object({
  at: z.iso.datetime({ offset: true }),
  author: authorSchema,
  /** `null` for an edit someone made; set when the entry takes earlier ones back. */
  cause: entryCauseSchema.nullable(),
  operation: operationSchema,
  revision: revisionSchema
})
export type ChangeLogEntry = z.infer<typeof changeLogEntrySchema>
