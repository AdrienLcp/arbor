import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { FamilyLineage } from '../tree-layout/family-lineage'
import type { KinPath } from './kinship'

/** One move along a kinship path: up to a parent, down to a child, or across to a partner. */
export type KinStep =
  | { direction: 'down' | 'up'; filiation: Filiation }
  | { direction: 'across'; union: Union | null }

const stepBetween = (
  lineage: FamilyLineage,
  { fromId, toId }: { fromId: EntityId; toId: EntityId }
): KinStep => {
  const toParent = lineage
    .parentLinksOf(fromId)
    .find(({ parentId }) => parentId === toId)
  if (toParent !== undefined) return { direction: 'up', filiation: toParent }

  const toChild = lineage
    .childLinksOf(fromId)
    .find(({ childId }) => childId === toId)
  if (toChild !== undefined) return { direction: 'down', filiation: toChild }

  const union =
    lineage
      .unionsOf(fromId)
      .findLast(({ partnerIds }) => partnerIds.includes(toId)) ?? null
  return { direction: 'across', union }
}

/** The moves between each two people next to each other on a path, one fewer than the people. */
export const kinStepsAlong = (
  lineage: FamilyLineage,
  path: KinPath
): KinStep[] =>
  path.slice(1).map((toId, index) => {
    const fromId = path[index] ?? toId
    return stepBetween(lineage, { fromId, toId })
  })
