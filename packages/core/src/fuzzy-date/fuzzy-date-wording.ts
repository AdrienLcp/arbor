import type { PointQualifier } from '@arbor/protocol/fuzzy-date'
import type { Locale } from '@arbor/protocol/locale'

type FuzzyDateWording = Record<Exclude<PointQualifier, 'exact'>, string> & {
  rangeEnd: string
  rangeStart: string
}

/** The words around a fuzzy date: "vers 1880", "entre 1930 et 1935". */
export const FUZZY_DATE_WORDING = {
  en: {
    about: 'about',
    after: 'after',
    before: 'before',
    rangeEnd: 'and',
    rangeStart: 'between'
  },
  fr: {
    about: 'vers',
    after: 'après',
    before: 'avant',
    rangeEnd: 'et',
    rangeStart: 'entre'
  }
} satisfies Record<Locale, FuzzyDateWording>
