import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyWarning } from '@arbor/core/family/family-warnings'

/** A date of this person's that core finds implausible, told from their side. */
export type PersonWarning =
  | { kind: 'born_before_parent'; parentId: EntityId }
  | { kind: 'born_after_child'; childId: EntityId }
  | { kind: 'death_before_birth' }

/** The family's date warnings that touch one person, each turned to face them. */
export const warningsAbout = (
  warnings: readonly FamilyWarning[],
  personId: EntityId
): PersonWarning[] =>
  warnings.flatMap((warning): PersonWarning[] => {
    switch (warning.kind) {
      case 'born_before_parent':
        if (warning.childId === personId) {
          return [{ kind: 'born_before_parent', parentId: warning.parentId }]
        }
        if (warning.parentId === personId) {
          return [{ childId: warning.childId, kind: 'born_after_child' }]
        }
        return []
      case 'death_before_birth':
        return warning.personId === personId
          ? [{ kind: 'death_before_birth' }]
          : []
      default:
        return warning satisfies never
    }
  })
