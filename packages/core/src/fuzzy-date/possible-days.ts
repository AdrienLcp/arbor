import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'

import { firstDayOf, lastDayOf } from './calendar-point'

/** How far either side of its year an "about" date may really lie. */
const ABOUT_TOLERANCE_YEARS = 2

/** The span a fuzzy date may cover; `null` is an open end ("before 1902" has no earliest day). */
type PossibleDays = {
  earliest: Temporal.PlainDate | null
  latest: Temporal.PlainDate | null
}

const possibleDaysOf = (date: FuzzyDate): PossibleDays => {
  switch (date.qualifier) {
    case 'exact':
      return { earliest: firstDayOf(date.point), latest: lastDayOf(date.point) }
    case 'about':
      return {
        earliest: firstDayOf(date.point).subtract({
          years: ABOUT_TOLERANCE_YEARS
        }),
        latest: lastDayOf(date.point).add({ years: ABOUT_TOLERANCE_YEARS })
      }
    case 'before':
      return {
        earliest: null,
        latest: firstDayOf(date.point).subtract({ days: 1 })
      }
    case 'after':
      return { earliest: lastDayOf(date.point).add({ days: 1 }), latest: null }
    case 'between':
      return { earliest: firstDayOf(date.from), latest: lastDayOf(date.to) }
  }
}

/** Whether `subject` lies before `reference` however their imprecision resolves. */
export const isCertainlyBefore = ({
  reference,
  subject
}: {
  reference: FuzzyDate
  subject: FuzzyDate
}): boolean => {
  const subjectLatest = possibleDaysOf(subject).latest
  const referenceEarliest = possibleDaysOf(reference).earliest
  return (
    subjectLatest !== null &&
    referenceEarliest !== null &&
    Temporal.PlainDate.compare(subjectLatest, referenceEarliest) < 0
  )
}
