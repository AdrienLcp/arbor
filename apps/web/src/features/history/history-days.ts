import type { Author, ChangeLogEntry } from '@arbor/protocol/change-log'

/** Consecutive entries one person made: the history shows them under a single signature. */
export type AuthorRun = {
  author: Author
  entries: ChangeLogEntry[]
}

export type HistoryDay = {
  dayKey: string
  runs: AuthorRun[]
}

/** The same signature reads the same: a person of the tree by their id, anyone else by the name they typed. */
export const authorKey = (author: Author): string =>
  author.kind === 'person'
    ? `person:${author.personId}`
    : `named:${author.name}`

/** Entries newest first, cut into days, then into runs of one author within a day. */
export const historyDays = ({
  dayKeyOf,
  entries
}: {
  dayKeyOf: (at: string) => string
  entries: readonly ChangeLogEntry[]
}): HistoryDay[] => {
  const days: HistoryDay[] = []
  for (const entry of entries.toReversed()) {
    const dayKey = dayKeyOf(entry.at)
    const day = days.at(-1)
    if (day?.dayKey !== dayKey) {
      days.push({ dayKey, runs: [{ author: entry.author, entries: [entry] }] })
      continue
    }
    const run = day.runs.at(-1)
    if (
      run !== undefined &&
      authorKey(run.author) === authorKey(entry.author)
    ) {
      run.entries.push(entry)
    } else {
      day.runs.push({ author: entry.author, entries: [entry] })
    }
  }
  return days
}
