import {
  type Author,
  authorKey,
  type ChangeLogEntry
} from '@arbor/protocol/change-log'

/** Consecutive entries one person made: the history shows them under a single signature. */
export type AuthorRun = {
  author: Author
  entries: ChangeLogEntry[]
}

export type HistoryDay = {
  dayKey: string
  runs: AuthorRun[]
}

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
