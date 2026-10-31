import { Result } from '@adrienlcp/result'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import type { Occurrence } from '@arbor/protocol/occurrence'
import type { EntityOperation } from '@arbor/protocol/operation'
import type { OperationRefusal } from '@arbor/protocol/operation-refusal'
import type { Union } from '@arbor/protocol/union'

import { applyInOrder } from '../family/apply-operation'
import type { FamilyState } from '../family/family-state'
import { siblingsThroughUnknownParent } from './unknown-parent'

/** A tie between a person and a relative who is already in the family. */
export type ExistingRelativeLink = {
  anchorId: EntityId
  relativeId: EntityId
} & (
  | { kind: FiliationKind; relation: 'child' | 'parent' }
  | { kind: Union['kind']; relation: 'partner'; start: Occurrence | null }
  | { relation: 'sibling' }
)

/**
 * Why two people of the family cannot be tied that way: a rule of the data
 * model, or one the link itself adds.
 * - `'same_person'` — the relative is the person
 * - `'already_partners'` — an ongoing union of that kind ties them already
 * - `'already_siblings'` — the relative is already a child of each of the person's parents
 */
export type LinkRefusal =
  | OperationRefusal
  | 'already_partners'
  | 'already_siblings'
  | 'same_person'

/** Makes a fresh id for each entity the link creates. */
type NewId = () => EntityId

const filiation = ({
  childId,
  kind,
  newId,
  parentId
}: {
  childId: EntityId
  kind: FiliationKind
  newId: NewId
  parentId: EntityId
}): EntityOperation => ({
  filiation: { childId, id: newId(), kind, parentId },
  type: 'filiation.create'
})

const isOngoingUnionOfKind = (
  union: Union,
  kind: Union['kind'],
  partnerIds: readonly EntityId[]
) =>
  union.end === null &&
  union.kind === kind &&
  partnerIds.every((partnerId) => union.partnerIds.includes(partnerId))

const parentLinksOf = (family: FamilyState, childId: EntityId) =>
  family.filiations
    .values()
    .filter((filiation) => filiation.childId === childId)
    .toArray()

/**
 * A brother or a sister becomes a child of each of the person's parents they
 * are not a child of yet, by the same kind of link. A person with no parent
 * in the tree takes the relative's instead; when neither has one, they share
 * a parent nobody knows yet.
 */
const siblingOperations = (
  family: FamilyState,
  { anchorId, relativeId }: ExistingRelativeLink,
  newId: NewId
): Result<EntityOperation[], LinkRefusal> => {
  if (parentLinksOf(family, anchorId).length === 0) {
    return parentLinksOf(family, relativeId).length === 0
      ? Result.success(
          siblingsThroughUnknownParent({
            newId,
            personId: anchorId,
            siblingId: relativeId
          })
        )
      : siblingOperations(
          family,
          {
            anchorId: relativeId,
            relation: 'sibling',
            relativeId: anchorId
          },
          newId
        )
  }

  const missing = parentLinksOf(family, anchorId).filter(
    ({ parentId }) =>
      !family.filiations
        .values()
        .some(
          (existing) =>
            existing.childId === relativeId && existing.parentId === parentId
        )
  )
  if (missing.length === 0) return Result.failure('already_siblings')

  return Result.success(
    missing.map(({ kind, parentId }) =>
      filiation({ childId: relativeId, kind, newId, parentId })
    )
  )
}

/** The operations that tie the relative to the person, or why they cannot be. Nothing is checked against the family's rules yet: `linkRefusal` does. */
export const existingRelativeLinkOperations = (
  family: FamilyState,
  link: ExistingRelativeLink,
  newId: NewId
): Result<EntityOperation[], LinkRefusal> => {
  const { anchorId, relativeId } = link
  if (anchorId === relativeId) return Result.failure('same_person')

  switch (link.relation) {
    case 'child':
      return Result.success([
        filiation({
          childId: relativeId,
          kind: link.kind,
          newId,
          parentId: anchorId
        })
      ])
    case 'parent':
      return Result.success([
        filiation({
          childId: anchorId,
          kind: link.kind,
          newId,
          parentId: relativeId
        })
      ])
    case 'partner':
      if (
        family.unions
          .values()
          .some((union) =>
            isOngoingUnionOfKind(union, link.kind, [anchorId, relativeId])
          )
      ) {
        return Result.failure('already_partners')
      }
      return Result.success([
        {
          type: 'union.create',
          union: {
            end: null,
            id: newId(),
            kind: link.kind,
            partnerIds: [anchorId, relativeId],
            start: link.start
          }
        }
      ])
    case 'sibling':
      return siblingOperations(family, link, newId)
  }
}

const DRY_RUN_ID_PREFIX = 'link-check'

/**
 * Whether the family would take the link, tried on a copy: the same rules as
 * a save, so a person a screen offers is one the server accepts. A screen calls
 * it for every candidate, to grey out the ones it would refuse and say why.
 */
export const linkRefusal = (
  family: FamilyState,
  link: ExistingRelativeLink
): LinkRefusal | null => {
  let created = 0
  const operations = existingRelativeLinkOperations(family, link, () => {
    created += 1
    return `${DRY_RUN_ID_PREFIX}-${created}`
  })
  if (operations.status === 'failure') return operations.error

  const applied = applyInOrder(family, operations.data)
  return applied.status === 'failure' ? applied.error.refusal : null
}
