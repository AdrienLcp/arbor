import type { Locale } from '@arbor/protocol/locale'

const MONTHS_IN_A_YEAR = 12

/** The twelve months by name in the interface's language, January first. */
export const monthNames = (locale: Locale): string[] =>
  Array.from({ length: MONTHS_IN_A_YEAR }, (_, index) =>
    Temporal.PlainDate.from({
      day: 1,
      month: index + 1,
      year: 2000
    }).toLocaleString(locale, { month: 'long' })
  )
