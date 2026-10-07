/** Why the family refused an operation: each one breaks a rule of the data model. */
export const OPERATION_REFUSALS = [
  'ancestry_cycle',
  'duplicate_filiation',
  'event_exists',
  'event_not_found',
  'filiation_exists',
  'filiation_not_found',
  'person_binned',
  'person_exists',
  'person_linked',
  'person_not_binned',
  'person_not_found',
  'photo_exists',
  'photo_is_portrait',
  'photo_not_found',
  'same_partner',
  'too_many_birth_parents',
  'union_exists',
  'union_not_found'
] as const
export type OperationRefusal = (typeof OPERATION_REFUSALS)[number]
