import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from './family-state'

/** A person new links may point at: one that exists and is not in the bin. */
export const requireActivePerson = (
  family: FamilyState,
  personId: EntityId
): Result<void, 'person_binned' | 'person_not_found'> => {
  if (!family.persons.has(personId)) return Result.failure('person_not_found')
  if (family.binnedPersonIds.has(personId)) {
    return Result.failure('person_binned')
  }
  return Result.success()
}

/** Like {@link requireActivePerson}, for a link that may be left empty. */
export const requireActivePersonIfAny = (
  family: FamilyState,
  personId: EntityId | null
): Result<void, 'person_binned' | 'person_not_found'> =>
  personId === null ? Result.success() : requireActivePerson(family, personId)
