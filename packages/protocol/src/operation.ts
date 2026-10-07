import { z } from 'zod'

import { entityIdSchema } from './entity-id'
import { filiationFieldsSchema, filiationSchema } from './filiation'
import { lifeEventFieldsSchema, lifeEventSchema } from './life-event'
import { personFieldsSchema, personSchema } from './person'
import { photoFieldsSchema, photoSchema } from './photo'
import { unionFieldsSchema, unionSchema } from './union'

const fieldNames = (fields: object) => Object.keys(fields).toSorted()

const changesTheSameFields = (change: { after: object; before: object }) => {
  const changed = fieldNames(change.after)
  const recorded = fieldNames(change.before)
  return (
    changed.length === recorded.length &&
    changed.every((name, index) => name === recorded[index])
  )
}

/** An edit records each changed field before and after, so undoing it swaps the two. */
const changeOf = <Fields extends z.ZodObject>(fields: Fields) =>
  z.object({ after: fields, before: fields })

const SAME_FIELDS = { message: 'before_and_after_differ_in_fields' }

const entityOperationSchema = z.discriminatedUnion('type', [
  z.object({ person: personSchema, type: z.literal('person.create') }),
  changeOf(personFieldsSchema)
    .extend({ personId: entityIdSchema, type: z.literal('person.update') })
    .refine(changesTheSameFields, SAME_FIELDS),
  z.object({ personId: entityIdSchema, type: z.literal('person.bin') }),
  z.object({ personId: entityIdSchema, type: z.literal('person.restore') }),
  z.object({ person: personSchema, type: z.literal('person.remove') }),

  z.object({ type: z.literal('union.create'), union: unionSchema }),
  changeOf(unionFieldsSchema)
    .extend({ type: z.literal('union.update'), unionId: entityIdSchema })
    .refine(changesTheSameFields, SAME_FIELDS),
  z.object({ type: z.literal('union.remove'), union: unionSchema }),

  z.object({ filiation: filiationSchema, type: z.literal('filiation.create') }),
  changeOf(filiationFieldsSchema)
    .extend({
      filiationId: entityIdSchema,
      type: z.literal('filiation.update')
    })
    .refine(changesTheSameFields, SAME_FIELDS),
  z.object({ filiation: filiationSchema, type: z.literal('filiation.remove') }),

  z.object({ event: lifeEventSchema, type: z.literal('event.create') }),
  changeOf(lifeEventFieldsSchema)
    .extend({ eventId: entityIdSchema, type: z.literal('event.update') })
    .refine(changesTheSameFields, SAME_FIELDS),
  z.object({ event: lifeEventSchema, type: z.literal('event.remove') }),

  z.object({ photo: photoSchema, type: z.literal('photo.create') }),
  changeOf(photoFieldsSchema)
    .extend({ photoId: entityIdSchema, type: z.literal('photo.update') })
    .refine(changesTheSameFields, SAME_FIELDS),
  z.object({ photo: photoSchema, type: z.literal('photo.remove') })
])
export type EntityOperation = z.infer<typeof entityOperationSchema>

/** Several operations applied as one — all or none — and undone together: a restore to a past moment is one. */
export type GroupOperation = { operations: Operation[]; type: 'group' }

/**
 * One write to a family, as appended to its change log. A removal carries the
 * whole removed entity so its inverse can bring it back. Deleting a person
 * bins them; `person.remove` only undoes a creation nothing links to yet.
 */
export type Operation = EntityOperation | GroupOperation

export const operationSchema: z.ZodType<Operation> = z.lazy(() =>
  z.union([
    entityOperationSchema,
    z.object({ operations: z.array(operationSchema), type: z.literal('group') })
  ])
)
