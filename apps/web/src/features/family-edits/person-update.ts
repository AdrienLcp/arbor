import type { EntityOperation } from '@arbor/protocol/operation'
import {
  type Person,
  type PersonFields,
  personFieldsSchema
} from '@arbor/protocol/person'

import { fieldChanges } from './field-changes'

/** The fields of a person a sheet's form can change. */
const EDITABLE_FIELDS = [
  'birth',
  'birthSurname',
  'death',
  'givenNames',
  'notes',
  'sex',
  'surname'
] as const satisfies readonly (keyof PersonFields)[]

/** The change a form makes to a person, its fields before and after; `null` when nothing differs. */
export const personUpdate = (
  person: Person,
  edited: PersonFields
): EntityOperation | null => {
  const changes = fieldChanges(
    personFieldsSchema,
    EDITABLE_FIELDS,
    person,
    edited
  )
  return changes === null
    ? null
    : { ...changes, personId: person.id, type: 'person.update' }
}
