import { z } from 'zod'

import { entityIdSchema } from './entity-id.ts'
import { occurrenceSchema } from './occurrence.ts'

export const NAME_MAX_LENGTH = 200
const NOTES_MAX_LENGTH = 20_000

export const SEXES = ['female', 'male', 'unknown'] as const

export const personSchema = z.object({
  birth: occurrenceSchema.nullable(),
  /** The surname at birth, when it differs from the one in use. */
  birthSurname: z.string().max(NAME_MAX_LENGTH).nullable(),
  /** `null` while no death is known; a death with no date nor place says the person died, details unknown. */
  death: occurrenceSchema.nullable(),
  givenNames: z.string().max(NAME_MAX_LENGTH),
  id: entityIdSchema,
  /** `null` lets the dates decide whether the person is living; a boolean overrides them. */
  livingOverride: z.boolean().nullable(),
  notes: z.string().max(NOTES_MAX_LENGTH),
  portraitPhotoId: entityIdSchema.nullable(),
  sex: z.enum(SEXES),
  surname: z.string().max(NAME_MAX_LENGTH)
})
export type Person = z.infer<typeof personSchema>

/** What an edit may change on a person: everything but the id. */
export const personFieldsSchema = personSchema.omit({ id: true }).partial()
export type PersonFields = z.infer<typeof personFieldsSchema>
