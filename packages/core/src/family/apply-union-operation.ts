import { Result } from '@adrienlcp/result'

import type { Operation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { requireActivePerson, requireActivePersonIfAny } from './active-person'
import { withEntry, withoutEntry } from './copy-with'
import type { FamilyState } from './family-state'

export type UnionOperation = Extract<Operation, { type: `union.${string}` }>

export const applyUnionOperation = (
  family: FamilyState,
  operation: UnionOperation
): Result<FamilyState, OperationRefusal> => {
  switch (operation.type) {
    case 'union.create': {
      const { union } = operation
      const [firstPartnerId, secondPartnerId] = union.partnerIds
      if (family.unions.has(union.id)) return Result.failure('union_exists')
      if (firstPartnerId === secondPartnerId) {
        return Result.failure('same_partner')
      }
      const firstPartner = requireActivePerson(family, firstPartnerId)
      if (firstPartner.status === 'failure') return firstPartner
      const secondPartner = requireActivePersonIfAny(family, secondPartnerId)
      if (secondPartner.status === 'failure') return secondPartner
      return Result.success({
        ...family,
        unions: withEntry(family.unions, union.id, union)
      })
    }
    case 'union.update': {
      const union = family.unions.get(operation.unionId)
      if (!union) return Result.failure('union_not_found')
      return Result.success({
        ...family,
        unions: withEntry(family.unions, union.id, {
          ...union,
          ...operation.after
        })
      })
    }
    case 'union.remove': {
      if (!family.unions.has(operation.union.id)) {
        return Result.failure('union_not_found')
      }
      return Result.success({
        ...family,
        unions: withoutEntry(family.unions, operation.union.id)
      })
    }
  }
}
