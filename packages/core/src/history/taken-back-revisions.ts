import type { ChangeLogEntry, EntryCause } from '@arbor/protocol/change-log'

const revisionsNamedBy = ({
  cause,
  revision
}: {
  cause: EntryCause
  revision: number
}): number[] =>
  cause.kind === 'undo'
    ? cause.revisions
    : Array.from(
        { length: revision - cause.revision - 1 },
        (_, index) => cause.revision + 1 + index
      )

/**
 * Which entries are taken back today, each with the revision of the entry that
 * took it back. An undo or a restore that is itself taken back takes nothing
 * back any more, so undoing an undo brings its entries back. `entries` runs
 * oldest first, as the log does.
 */
export const takenBackRevisions = (
  entries: readonly ChangeLogEntry[]
): ReadonlyMap<number, number> => {
  const takenBack = new Map<number, number>()
  for (const { cause, revision } of entries.toReversed()) {
    if (cause === null || takenBack.has(revision)) continue
    for (const named of revisionsNamedBy({ cause, revision })) {
      if (!takenBack.has(named)) takenBack.set(named, revision)
    }
  }
  return takenBack
}
