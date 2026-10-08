import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'
import type { Occurrence } from '@arbor/protocol/occurrence'

import { formatFuzzyDate } from '@arbor/core/fuzzy-date/format-fuzzy-date'

import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

/** When and where something happened, in the words of a sheet. */
export const useOccurrenceWords = () => {
  const translate = useTranslate()
  const locale = useLocale()

  /** A date as it follows a verb: "on 7 July 1956", "in 1956", "about 1880". */
  const dateAfterVerb = (date: FuzzyDate): string => {
    const written = formatFuzzyDate(date, locale)
    if (date.qualifier !== 'exact') return written
    return date.point.precision === 'day'
      ? translate('sheet.onDay', { date: written })
      : translate('sheet.inPeriod', { date: written })
  }

  return {
    /** What follows a verb: "on 7 July 1956 in Nantes"; empty when nothing is known. */
    afterVerb: (occurrence: Occurrence | null): string =>
      [
        occurrence?.date == null ? null : dateAfterVerb(occurrence.date),
        occurrence?.place == null
          ? null
          : translate('sheet.atPlace', { place: occurrence.place })
      ]
        .filter((part) => part !== null)
        .join(' '),
    /** The value of a fact line: "7 July 1956, in Nantes"; `null` when nothing is known. */
    fact: (occurrence: Occurrence): string | null => {
      const parts = [
        occurrence.date === null
          ? null
          : formatFuzzyDate(occurrence.date, locale),
        occurrence.place === null
          ? null
          : translate('sheet.atPlace', { place: occurrence.place })
      ].filter((part) => part !== null)
      return parts.length === 0 ? null : parts.join(', ')
    }
  }
}
