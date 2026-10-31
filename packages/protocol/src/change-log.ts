import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { operationSchema } from './operation.ts'
import { NAME_MAX_LENGTH } from './person.ts'

const personAuthorSchema = z.object({
  kind: z.literal('person'),
  personId: entityIdSchema
})
const namedAuthorSchema = z.object({
  kind: z.literal('named'),
  name: z.string().min(1).max(NAME_MAX_LENGTH)
})

/** Who the visitor said they are on "Who are you in this tree?": a person of the tree, or a name typed by someone not in it yet. */
export const declaredAuthorSchema = z.discriminatedUnion('kind', [
  personAuthorSchema,
  namedAuthorSchema
])
export type DeclaredAuthor = z.infer<typeof declaredAuthorSchema>

/**
 * Who signs a change: who the visitor said they are, or someone of the family
 * who never said — the link is the permission, so saying it is never required.
 */
export const authorSchema = z.discriminatedUnion('kind', [
  personAuthorSchema,
  namedAuthorSchema,
  z.object({ kind: z.literal('anonymous') })
])
export type Author = z.infer<typeof authorSchema>

/** The signature of a change made by a visitor who never said who they are. */
export const ANONYMOUS_AUTHOR: Author = { kind: 'anonymous' }

/** The same signature reads the same: a person of the tree by their id, a typed name by that name, and every unsigned change as one. */
export const authorKey = (author: Author): string => {
  switch (author.kind) {
    case 'person':
      return `person:${author.personId}`
    case 'named':
      return `named:${author.name}`
    case 'anonymous':
      return 'anonymous'
    default:
      return author satisfies never
  }
}

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
