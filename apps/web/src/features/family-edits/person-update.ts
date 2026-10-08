import type { EntityOperation } from '@arbor/protocol/operation'
import {
  type Person,
  type PersonFields,
  personFieldsSchema
} from '@arbor/protocol/person'

type PersonField = keyof PersonFields

/** The fields of a person a sheet's form can change. */
const EDITABLE_FIELDS = [
  'birth',
  'birthSurname',
  'death',
  'givenNames',
  'notes',
  'sex',
  'surname'
] as const satisfies readonly PersonField[]

const fieldsOf = (
  source: PersonFields,
  fields: readonly PersonField[]
): PersonFields =>
  personFieldsSchema.parse(
    Object.fromEntries(fields.map((field) => [field, source[field]]))
  )

/** The change a form makes to a person, its fields before and after; `null` when nothing differs. */
export const personUpdate = (
  person: Person,
  edited: PersonFields
): EntityOperation | null => {
  const offered = EDITABLE_FIELDS.filter((field) => edited[field] !== undefined)
  // Both sides go through the same schema, so their keys come out in one order and compare as text.
  const before = fieldsOf(person, offered)
  const after = fieldsOf(edited, offered)
  const changed = offered.filter(
    (field) => JSON.stringify(before[field]) !== JSON.stringify(after[field])
  )
  if (changed.length === 0) return null

  return {
    after: fieldsOf(edited, changed),
    before: fieldsOf(person, changed),
    personId: person.id,
    type: 'person.update'
  }
}
