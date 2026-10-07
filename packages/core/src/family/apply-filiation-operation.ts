import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { requireActivePerson } from './active-person'
import { isAncestor } from './ancestry'
import { withEntry, withoutEntry } from './copy-with'
import type { FamilyState } from './family-state'

export type FiliationOperation = Extract<
  Operation,
  { type: `filiation.${string}` }
>

const MAX_BIRTH_PARENTS = 2

const hasRoomForBirthParent = (
  family: FamilyState,
  {
    childId,
    exceptFiliationId
  }: { childId: EntityId; exceptFiliationId: EntityId }
) =>
  family.filiations
    .values()
    .filter(
      (filiation) =>
        filiation.childId === childId &&
        filiation.kind === 'birth' &&
        filiation.id !== exceptFiliationId
    )
    .toArray().length < MAX_BIRTH_PARENTS

const isAlreadyLinked = (
  family: FamilyState,
  { childId, parentId }: Filiation
) =>
  family.filiations
    .values()
    .some(
      (filiation) =>
        filiation.childId === childId && filiation.parentId === parentId
    )

const createFiliation = (
  family: FamilyState,
  filiation: Filiation
): Result<FamilyState, OperationRefusal> => {
  if (family.filiations.has(filiation.id)) {
    return Result.failure('filiation_exists')
  }
  const child = requireActivePerson(family, filiation.childId)
  if (child.status === 'failure') return child
  const parent = requireActivePerson(family, filiation.parentId)
  if (parent.status === 'failure') return parent
  if (
    filiation.parentId === filiation.childId ||
    isAncestor(family, {
      ancestorId: filiation.childId,
      descendantId: filiation.parentId
    })
  ) {
    return Result.failure('ancestry_cycle')
  }
  if (isAlreadyLinked(family, filiation)) {
    return Result.failure('duplicate_filiation')
  }
  if (
    filiation.kind === 'birth' &&
    !hasRoomForBirthParent(family, {
      childId: filiation.childId,
      exceptFiliationId: filiation.id
    })
  ) {
    return Result.failure('too_many_birth_parents')
  }
  return Result.success({
    ...family,
    filiations: withEntry(family.filiations, filiation.id, filiation)
  })
}

export const applyFiliationOperation = (
  family: FamilyState,
  operation: FiliationOperation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'filiation.create':
      return createFiliation(family, operation.filiation)
    case 'filiation.update': {
      const filiation = family.filiations.get(operation.filiationId)
      if (!filiation) return Result.failure('filiation_not_found')
      if (
        operation.after.kind === 'birth' &&
        !hasRoomForBirthParent(family, {
          childId: filiation.childId,
          exceptFiliationId: filiation.id
        })
      ) {
        return Result.failure('too_many_birth_parents')
      }
      return Result.success({
        ...family,
        filiations: withEntry(family.filiations, filiation.id, {
          ...filiation,
          ...operation.after
        })
      })
    }
    case 'filiation.remove': {
      if (!family.filiations.has(operation.filiation.id)) {
        return Result.failure('filiation_not_found')
      }
      return Result.success({
        ...family,
        filiations: withoutEntry(family.filiations, operation.filiation.id)
      })
    }
  }
}
