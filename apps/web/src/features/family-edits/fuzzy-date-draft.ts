import { Result } from '@adrienlcp/result'

import {
  type CalendarPoint,
  calendarPointSchema,
  type FuzzyDate,
  POINT_QUALIFIERS
} from '@arbor/protocol/fuzzy-date'

import { firstDayOf, lastDayOf } from '@arbor/core/fuzzy-date/calendar-point'

/** How sure the date is: the point qualifiers, or a span between two dates. */
export const DATE_QUALIFIERS = [...POINT_QUALIFIERS, 'between'] as const
export type DateQualifier = (typeof DATE_QUALIFIERS)[number]

/** A calendar point as typed: each part may be empty, the month is its number. */
export type PointDraft = {
  day: string
  /** `''`, or `'1'` to `'12'`. */
  month: string
  year: string
}

/** A date being typed: a qualifier, one point, and the end of the span when it is "between". */
export type DateDraft = {
  from: PointDraft
  qualifier: DateQualifier
  to: PointDraft
}

/** Why a typed date cannot be kept, worded for the person typing it. */
export type DateDraftProblem =
  | 'impossible_date'
  | 'range_end_missing'
  | 'reversed_range'
  | 'year_missing'

const EMPTY_POINT: PointDraft = { day: '', month: '', year: '' }

export const EMPTY_DATE_DRAFT: DateDraft = {
  from: EMPTY_POINT,
  qualifier: 'exact',
  to: EMPTY_POINT
}

const pointDraftOf = (point: CalendarPoint): PointDraft => ({
  day: point.precision === 'day' ? String(point.day) : '',
  month: point.precision === 'year' ? '' : String(point.month),
  year: String(point.year)
})

/** The fields to show for a date already recorded, empty for an unknown one. */
export const dateDraftOf = (date: FuzzyDate | null): DateDraft => {
  if (date === null) return EMPTY_DATE_DRAFT
  return date.qualifier === 'between'
    ? {
        from: pointDraftOf(date.from),
        qualifier: 'between',
        to: pointDraftOf(date.to)
      }
    : {
        from: pointDraftOf(date.point),
        qualifier: date.qualifier,
        to: EMPTY_POINT
      }
}

const isBlank = (point: PointDraft): boolean =>
  point.day.trim() === '' && point.month === '' && point.year.trim() === ''

const WHOLE_NUMBER = /^\d+$/

const numberOf = (typed: string): number | null => {
  const trimmed = typed.trim()
  return WHOLE_NUMBER.test(trimmed) ? Number(trimmed) : null
}

/** A typed point as the model holds it: the year alone is enough, a day needs its month. */
const pointOf = (
  draft: PointDraft
): Result<CalendarPoint, 'impossible_date' | 'year_missing'> => {
  const year = numberOf(draft.year)
  const month = numberOf(draft.month)
  const day = numberOf(draft.day)
  if (draft.year.trim() === '') return Result.failure('year_missing')
  if (year === null) return Result.failure('impossible_date')
  if (draft.day.trim() !== '' && (day === null || month === null)) {
    return Result.failure('impossible_date')
  }
  const point =
    day !== null && month !== null
      ? { day, month, precision: 'day', year }
      : month === null
        ? { precision: 'year', year }
        : { month, precision: 'month', year }
  const parsed = calendarPointSchema.safeParse(point)
  return parsed.success
    ? Result.success(parsed.data)
    : Result.failure('impossible_date')
}

/** The date the fields say: `null` when they are all empty, since an unknown date is a valid answer. */
export const fuzzyDateOf = (
  draft: DateDraft
): Result<FuzzyDate | null, DateDraftProblem> => {
  if (
    isBlank(draft.from) &&
    (draft.qualifier !== 'between' || isBlank(draft.to))
  ) {
    return Result.success(null)
  }
  const from = pointOf(draft.from)
  if (from.status === 'failure') return from
  if (draft.qualifier !== 'between') {
    return Result.success({ point: from.data, qualifier: draft.qualifier })
  }
  if (isBlank(draft.to)) return Result.failure('range_end_missing')
  const to = pointOf(draft.to)
  if (to.status === 'failure') return to
  if (
    Temporal.PlainDate.compare(lastDayOf(to.data), firstDayOf(from.data)) < 0
  ) {
    return Result.failure('reversed_range')
  }
  return Result.success({ from: from.data, qualifier: 'between', to: to.data })
}
