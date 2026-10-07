import type { EntityId } from '@arbor/protocol/entity-id'

import { isCertainlyBefore } from '../fuzzy-date/possible-days'
import type { FamilyState } from './family-state'

/** A date that looks wrong: shown to the family, never blocking — old records are often mistaken. */
export type FamilyWarning =
  | { kind: 'born_before_parent'; childId: EntityId; parentId: EntityId }
  | { kind: 'death_before_birth'; personId: EntityId }

const deathsBeforeBirth = (family: FamilyState): FamilyWarning[] =>
  family.persons
    .values()
    .filter(({ birth, death, id }) => {
      if (family.binnedPersonIds.has(id) || !birth?.date || !death?.date) {
        return false
      }
      return isCertainlyBefore({ reference: birth.date, subject: death.date })
    })
    .map(
      ({ id }): FamilyWarning => ({ kind: 'death_before_birth', personId: id })
    )
    .toArray()

const birthsBeforeParent = (family: FamilyState): FamilyWarning[] =>
  family.filiations
    .values()
    .filter(({ childId, kind, parentId }) => {
      const childBirth = family.persons.get(childId)?.birth?.date
      const parentBirth = family.persons.get(parentId)?.birth?.date
      if (
        kind !== 'birth' ||
        family.binnedPersonIds.has(childId) ||
        family.binnedPersonIds.has(parentId) ||
        !childBirth ||
        !parentBirth
      ) {
        return false
      }
      return isCertainlyBefore({ reference: parentBirth, subject: childBirth })
    })
    .map(
      ({ childId, parentId }): FamilyWarning => ({
        childId,
        kind: 'born_before_parent',
        parentId
      })
    )
    .toArray()

/** Every implausible date in the family, people in the bin left out. */
export const familyWarnings = (family: FamilyState): FamilyWarning[] => [
  ...deathsBeforeBirth(family),
  ...birthsBeforeParent(family)
]
