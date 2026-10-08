import type { Occurrence } from '@arbor/protocol/occurrence'

/** Typed text as the model keeps it: trimmed, and `null` when nothing is left. */
export const textOrNull = (typed: string): string | null => typed.trim() || null

/** What a date and a place field say happened: `null` when neither is known. */
export const occurrenceOf = (
  date: Occurrence['date'],
  place: string
): Occurrence | null =>
  date === null && textOrNull(place) === null
    ? null
    : { date, place: textOrNull(place) }
