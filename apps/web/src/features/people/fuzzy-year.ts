import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'

/** The year a date is printed with: a range shows its first year; `null` when no date is known. */
export const yearOf = (date: FuzzyDate | null | undefined): number | null => {
  if (date === null || date === undefined) {
    return null
  }

  return date.qualifier === 'between' ? date.from.year : date.point.year
}
