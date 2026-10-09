import type { EntityId } from '@arbor/protocol/entity-id'

import { haveSameKinParents, kinParentIdsOf } from '../relatives/kin-parents'
import type { FamilyLineage } from '../tree-layout/family-lineage'
import type { BloodTie, KinshipSources, Sex } from './kinship'

/** Each ancestor reached from one person, at its shortest distance, with the child it was reached from. */
type Climb = ReadonlyMap<EntityId, ClimbStep>

type ClimbStep = { childId: EntityId | null; generations: number }

const climbKinParents = (lineage: FamilyLineage, startId: EntityId): Climb => {
  const climb = new Map<EntityId, ClimbStep>([
    [startId, { childId: null, generations: 0 }]
  ])
  const reachedInOrder: EntityId[] = [startId]

  for (const childId of reachedInOrder) {
    const generations = (climb.get(childId)?.generations ?? 0) + 1
    for (const parentId of kinParentIdsOf(lineage, childId)) {
      if (!climb.has(parentId)) {
        climb.set(parentId, { childId, generations })
        reachedInOrder.push(parentId)
      }
    }
  }
  return climb
}

/** From the climb's start up to `ancestorId`, both included. */
const lineUpTo = (climb: Climb, ancestorId: EntityId): EntityId[] => {
  const line: EntityId[] = []
  for (
    let current: EntityId | null = ancestorId;
    current !== null;
    current = climb.get(current)?.childId ?? null
  ) {
    line.push(current)
  }
  return line.toReversed()
}

/** The person met `generations` above the start of a line, `'unknown'` past its end. */
const sexAt = (
  { sexOf }: KinshipSources,
  line: readonly EntityId[],
  generations: number
): Sex => {
  const personId = line.at(generations)
  return personId === undefined ? 'unknown' : sexOf(personId)
}

const removedLinkSexOf = (
  sources: KinshipSources,
  {
    personLine,
    relativeLine
  }: { personLine: readonly EntityId[]; relativeLine: readonly EntityId[] }
): Sex | null => {
  const up = personLine.length - 1
  const down = relativeLine.length - 1
  if (Math.min(up, down) < 2 || up === down) return null
  return up > down
    ? sexAt(sources, personLine, up - down)
    : sexAt(sources, relativeLine, down - up)
}

/** Below the shared ancestor, the two first people of each side do not share both parents. */
const isHalfTie = (
  { lineage }: KinshipSources,
  {
    personLine,
    relativeLine
  }: { personLine: readonly EntityId[]; relativeLine: readonly EntityId[] }
): boolean => {
  const personBranchId = personLine.at(-2)
  const relativeBranchId = relativeLine.at(-2)
  if (personBranchId === undefined || relativeBranchId === undefined) {
    return false
  }
  return !haveSameKinParents(lineage, {
    firstId: personBranchId,
    secondId: relativeBranchId
  })
}

/** How the relative descends from the ancestors the person shares with them, `null` when they share none. */
export const bloodTie = (
  sources: KinshipSources,
  { personId, relativeId }: { personId: EntityId; relativeId: EntityId }
): BloodTie | null => {
  const fromPerson = climbKinParents(sources.lineage, personId)
  const fromRelative = climbKinParents(sources.lineage, relativeId)

  const [closest] = [...fromPerson]
    .flatMap(([ancestorId, { generations: up }]) => {
      const down = fromRelative.get(ancestorId)?.generations
      return down === undefined ? [] : [{ ancestorId, down, up }]
    })
    .toSorted((left, right) => left.up + left.down - (right.up + right.down))
  if (closest === undefined) return null

  const personLine = lineUpTo(fromPerson, closest.ancestorId)
  const relativeLine = lineUpTo(fromRelative, closest.ancestorId)
  const lines = { personLine, relativeLine }

  return {
    degree: { down: closest.down, up: closest.up },
    isHalf: isHalfTie(sources, lines),
    path: [...personLine, ...relativeLine.toReversed().slice(1)],
    removedLinkSex: removedLinkSexOf(sources, lines)
  }
}
