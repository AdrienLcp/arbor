import type { EntityId } from '@arbor/protocol/entity-id'

import { isRaisingLink } from '../relatives/kin-parents'
import { bloodTie } from './blood-tie'
import type {
  BloodTie,
  InLawBridge,
  KinDegree,
  KinshipSources
} from './kinship'

export type InLawTie = { bridge: InLawBridge; isFormer: boolean; tie: BloodTie }

/** One step off the blood relations: to a partner, or along a step or foster link. */
type Crossing = {
  bridge: InLawBridge
  isFormer: boolean
  /** Where the person reached stands from the one it is reached from: `1` a generation up, `-1` down. */
  generationStep: -1 | 0 | 1
  reachedId: EntityId
}

const crossingsFrom = (
  { lineage }: KinshipSources,
  { personId, side }: { personId: EntityId; side: 'person' | 'relative' }
): Crossing[] => [
  ...lineage.unionsOf(personId).flatMap(({ end, partnerIds }): Crossing[] => {
    const partnerId = partnerIds.find((id) => id !== personId) ?? null
    return partnerId === null
      ? []
      : [
          {
            bridge: `${side}-partner`,
            generationStep: 0,
            isFormer: end !== null,
            reachedId: partnerId
          }
        ]
  }),
  ...lineage
    .parentLinksOf(personId)
    .filter(isRaisingLink)
    .map(
      ({ kind, parentId }): Crossing => ({
        bridge: kind,
        generationStep: 1,
        isFormer: false,
        reachedId: parentId
      })
    ),
  ...lineage
    .childLinksOf(personId)
    .filter(isRaisingLink)
    .map(
      ({ childId, kind }): Crossing => ({
        bridge: kind,
        generationStep: -1,
        isFormer: false,
        reachedId: childId
      })
    )
]

/**
 * The degree once the crossing is added on the person's side. Going down to a
 * step-child and then up again would make an uncle of a half-brother: only a
 * crossing down to an ancestor of the relative is kept.
 */
const degreeCrossedFromPerson = (
  { down, up }: KinDegree,
  generationStep: Crossing['generationStep']
): KinDegree | null => {
  if (generationStep === 1) return { down, up: up + 1 }
  if (generationStep === -1) return up === 0 ? { down: down + 1, up } : null
  return { down, up }
}

/** The mirror of {@link degreeCrossedFromPerson}, on the relative's side. */
const degreeCrossedFromRelative = (
  { down, up }: KinDegree,
  generationStep: Crossing['generationStep']
): KinDegree | null => {
  if (generationStep === 1) return { down: down + 1, up }
  if (generationStep === -1) return down === 0 ? { down, up: up + 1 } : null
  return { down, up }
}

const crossedTie = (
  tie: BloodTie,
  {
    crossing,
    degree,
    path
  }: { crossing: Crossing; degree: KinDegree; path: BloodTie['path'] }
): InLawTie => ({
  bridge: crossing.bridge,
  isFormer: crossing.isFormer,
  tie: {
    degree,
    isHalf: false,
    path,
    removedLinkSex:
      crossing.generationStep === 0 ? tie.removedLinkSex : 'unknown'
  }
})

const generationsApart = ({ tie: { degree } }: InLawTie): number =>
  degree.up + degree.down

const byCloseness = (left: InLawTie, right: InLawTie): number =>
  generationsApart(left) - generationsApart(right) ||
  left.tie.path.length - right.tie.path.length

/**
 * The closest relation by marriage: a blood relation of the person's partner
 * or step-parent, or the partner or step-child of one of the person's blood
 * relations. `null` when no single crossing joins the two families.
 */
export const inLawTie = (
  sources: KinshipSources,
  { personId, relativeId }: { personId: EntityId; relativeId: EntityId }
): InLawTie | null => {
  const fromRelativeSide = crossingsFrom(sources, {
    personId: relativeId,
    side: 'relative'
  }).flatMap((crossing) => {
    const tie = bloodTie(sources, { personId, relativeId: crossing.reachedId })
    const degree =
      tie === null
        ? null
        : degreeCrossedFromRelative(tie.degree, crossing.generationStep)
    return tie === null || degree === null
      ? []
      : [crossedTie(tie, { crossing, degree, path: [...tie.path, relativeId] })]
  })
  const fromPersonSide = crossingsFrom(sources, {
    personId,
    side: 'person'
  }).flatMap((crossing) => {
    const tie = bloodTie(sources, { personId: crossing.reachedId, relativeId })
    const degree =
      tie === null
        ? null
        : degreeCrossedFromPerson(tie.degree, crossing.generationStep)
    return tie === null || degree === null
      ? []
      : [crossedTie(tie, { crossing, degree, path: [personId, ...tie.path] })]
  })

  return (
    [...fromRelativeSide, ...fromPersonSide].toSorted(byCloseness)[0] ?? null
  )
}
