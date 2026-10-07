import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'

import { firstDayOf, lastDayOf } from './calendar-point'

/**
 * The day a fuzzy date sorts and counts ages from: the first day it names, the
 * day before a "before", the day after an "after".
 */
export const earliestPlausibleDay = (date: FuzzyDate): Temporal.PlainDate => {
  switch (date.qualifier) {
    case 'exact':
    case 'about':
      return firstDayOf(date.point)
    case 'before':
      return firstDayOf(date.point).subtract({ days: 1 })
    case 'after':
      return lastDayOf(date.point).add({ days: 1 })
    case 'between':
      return firstDayOf(date.from)
  }
}

/** Comparator for `toSorted`: chronological by earliest plausible day. */
export const byEarliestPlausibleDay = (left: FuzzyDate, right: FuzzyDate) =>
  Temporal.PlainDate.compare(
    earliestPlausibleDay(left),
    earliestPlausibleDay(right)
  )
