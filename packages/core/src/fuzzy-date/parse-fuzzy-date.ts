import { Result } from '@adrienlcp/result'

import {
  type CalendarPoint,
  calendarPointSchema,
  type FuzzyDate,
  type PointQualifier
} from '@arbor/protocol/fuzzy-date'

import { firstDayOf } from './calendar-point'

export type FuzzyDateParseFailure =
  | 'impossible_date'
  | 'reversed_range'
  | 'unreadable'

const GEDCOM_MONTHS: readonly string[] = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
]

const QUALIFIER_BY_GEDCOM_KEYWORD = {
  ABT: 'about',
  AFT: 'after',
  BEF: 'before',
  CAL: 'about',
  EST: 'about'
} satisfies Record<string, PointQualifier>

const RANGE_PATTERN = /^BET (.+) AND (.+)$/
const QUALIFIED_PATTERN = /^([A-Z]{3}) (.+)$/
const ISO_POINT_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/
const GEDCOM_POINT_PATTERN = /^(?:(?:(\d{1,2}) )?([A-Z]{3}) )?(\d{1,4})$/

const isGedcomKeyword = (
  word: string
): word is keyof typeof QUALIFIER_BY_GEDCOM_KEYWORD =>
  Object.hasOwn(QUALIFIER_BY_GEDCOM_KEYWORD, word)

const pointFrom = ({
  day,
  month,
  year
}: {
  day: number | undefined
  month: number | undefined
  year: number
}): CalendarPoint => {
  if (month === undefined) return { precision: 'year', year }
  if (day === undefined) return { month, precision: 'month', year }
  return { day, month, precision: 'day', year }
}

const optionalNumber = (digits: string | undefined) =>
  digits === undefined ? undefined : Number(digits)

const readPointNumbers = (text: string) => {
  const iso = ISO_POINT_PATTERN.exec(text)
  if (iso) {
    return {
      day: optionalNumber(iso[3]),
      month: optionalNumber(iso[2]),
      year: Number(iso[1])
    }
  }
  const gedcom = GEDCOM_POINT_PATTERN.exec(text)
  if (!gedcom) return null
  const monthIndex =
    gedcom[2] === undefined ? -1 : GEDCOM_MONTHS.indexOf(gedcom[2])
  if (gedcom[2] !== undefined && monthIndex === -1) return null
  return {
    day: optionalNumber(gedcom[1]),
    month: gedcom[2] === undefined ? undefined : monthIndex + 1,
    year: Number(gedcom[3])
  }
}

const parsePoint = (
  text: string
): Result<CalendarPoint, 'impossible_date' | 'unreadable'> => {
  const numbers = readPointNumbers(text)
  if (numbers === null) return Result.failure('unreadable')
  const point = calendarPointSchema.safeParse(pointFrom(numbers))
  if (!point.success) return Result.failure('impossible_date')
  return Result.success(point.data)
}

const parseRange = ({
  fromText,
  toText
}: {
  fromText: string
  toText: string
}): Result<FuzzyDate, FuzzyDateParseFailure> => {
  const from = parsePoint(fromText)
  if (from.status === 'failure') return from
  const to = parsePoint(toText)
  if (to.status === 'failure') return to
  if (
    Temporal.PlainDate.compare(firstDayOf(from.data), firstDayOf(to.data)) > 0
  ) {
    return Result.failure('reversed_range')
  }
  return Result.success({ from: from.data, qualifier: 'between', to: to.data })
}

/**
 * Reads a date as a GEDCOM file or a hand-typed ISO date gives it:
 * `1881-03-02`, `2 MAR 1881`, `ABT 1880`, `BEF 1902`, `BET 1930 AND 1935`.
 */
export const parseFuzzyDate = (
  text: string
): Result<FuzzyDate, FuzzyDateParseFailure> => {
  const normalized = text.trim().toUpperCase().replaceAll(/\s+/g, ' ')

  const range = RANGE_PATTERN.exec(normalized)
  if (range?.[1] !== undefined && range[2] !== undefined) {
    return parseRange({ fromText: range[1], toText: range[2] })
  }

  const qualified = QUALIFIED_PATTERN.exec(normalized)
  const keyword = qualified?.[1]
  const qualifier =
    keyword !== undefined && isGedcomKeyword(keyword)
      ? QUALIFIER_BY_GEDCOM_KEYWORD[keyword]
      : 'exact'
  const pointText =
    qualifier === 'exact' ? normalized : (qualified?.[2] ?? normalized)

  const point = parsePoint(pointText)
  if (point.status === 'failure') return point
  return Result.success({ point: point.data, qualifier })
}
