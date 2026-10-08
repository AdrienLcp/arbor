import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { buildsOn, type OperationReach, reachOf } from './operation-reach'
import { takenBackRevisions } from './taken-back-revisions'

/**
 * The later entries that build on the chosen ones, directly or through one
 * another, oldest first: taking the chosen ones back alone would break them,
 * so they must be taken back together. `entries` runs oldest first and holds
 * at least every entry from the earliest chosen one on.
 *
 * An entry taken back acts no more, and neither does an undo or a restore:
 * what it takes back cannot be older than a chosen entry it overlaps, or that
 * entry would have been taken back with it.
 */
export const laterDependents = ({
  entries,
  revisions
}: {
  entries: readonly ChangeLogEntry[]
  revisions: readonly number[]
}): number[] => {
  const chosen = new Set(revisions)
  const earliest = Math.min(...revisions)
  const takenBack = takenBackRevisions(entries)
  const reached: OperationReach[] = []
  const dependents: number[] = []

  for (const entry of entries) {
    if (entry.revision < earliest) continue
    const reach = reachOf(entry.operation)
    if (chosen.has(entry.revision)) {
      reached.push(...reach)
      continue
    }
    if (entry.cause !== null || takenBack.has(entry.revision)) continue
    const dependsOnReached = reach.some((later) =>
      reached.some((earlier) => buildsOn({ earlier, later }))
    )
    if (dependsOnReached) {
      dependents.push(entry.revision)
      reached.push(...reach)
    }
  }
  return dependents
}
