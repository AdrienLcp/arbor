import type { EntityOperation } from '@arbor/protocol/operation'
import {
  type Union,
  type UnionFields,
  unionFieldsSchema
} from '@arbor/protocol/union'

import { fieldChanges } from './field-changes'

const EDITABLE_FIELDS = [
  'end',
  'kind',
  'start'
] as const satisfies readonly (keyof UnionFields)[]

/** The change a form makes to a union, its fields before and after; `null` when nothing differs. */
export const unionUpdate = (
  union: Union,
  edited: UnionFields
): EntityOperation | null => {
  const changes = fieldChanges(
    unionFieldsSchema,
    EDITABLE_FIELDS,
    union,
    edited
  )
  return changes === null
    ? null
    : { ...changes, type: 'union.update', unionId: union.id }
}
