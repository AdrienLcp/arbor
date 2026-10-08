import type { EntityId } from '@arbor/protocol/entity-id'

import { bloodTie } from './blood-tie'
import { inLawTie } from './in-law-tie'
import type { Kinship, KinshipSources } from './kinship'

/**
 * What `relativeId` is to `personId`. A couple is named as a couple even when
 * they are also cousins; then blood comes before marriage, and the closest
 * relation wins.
 */
export const kinshipBetween = (
  sources: KinshipSources,
  { personId, relativeId }: { personId: EntityId; relativeId: EntityId }
): Kinship => {
  if (personId === relativeId) return { kind: 'self' }

  const relativeSex = sources.sexOf(relativeId)
  const union = sources.lineage
    .unionsOf(personId)
    .findLast(({ partnerIds }) => partnerIds.includes(relativeId))
  if (union !== undefined) {
    return {
      kind: 'partner',
      path: [personId, relativeId],
      relativeSex,
      union
    }
  }

  const tie = bloodTie(sources, { personId, relativeId })
  if (tie !== null) return { kind: 'blood', relativeSex, tie }

  const inLaw = inLawTie(sources, { personId, relativeId })
  if (inLaw !== null) return { kind: 'in-law', relativeSex, ...inLaw }

  return { kind: 'unrelated' }
}
