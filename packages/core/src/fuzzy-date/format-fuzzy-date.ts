import type { CalendarPoint, FuzzyDate } from '@arbor/protocol/fuzzy-date'
import type { Locale } from '@arbor/protocol/locale'

import { firstDayOf } from './calendar-point'
import { FUZZY_DATE_WORDING } from './fuzzy-date-wording'

const POINT_FORMAT = {
  day: { day: 'numeric', month: 'long', year: 'numeric' },
  month: { month: 'long', year: 'numeric' }
} satisfies Record<
  Exclude<CalendarPoint['precision'], 'year'>,
  Intl.DateTimeFormatOptions
>

const formatPoint = (point: CalendarPoint, locale: Locale): string =>
  point.precision === 'year'
    ? String(point.year)
    : firstDayOf(point).toLocaleString(locale, POINT_FORMAT[point.precision])

/** A fuzzy date as a sentence fragment: "vers 1880", "2 mars 1881", "entre 1930 et 1935". */
export const formatFuzzyDate = (date: FuzzyDate, locale: Locale): string => {
  const wording = FUZZY_DATE_WORDING[locale]
  switch (date.qualifier) {
    case 'exact':
      return formatPoint(date.point, locale)
    case 'between':
      return `${wording.rangeStart} ${formatPoint(date.from, locale)} ${wording.rangeEnd} ${formatPoint(date.to, locale)}`
    default:
      return `${wording[date.qualifier]} ${formatPoint(date.point, locale)}`
  }
}
