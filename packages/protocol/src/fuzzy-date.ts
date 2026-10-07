import { z } from 'zod'

const yearSchema = z.int().min(1).max(9999)
const monthSchema = z.int().min(1).max(12)

const isDayInMonth = (point: { day: number; month: number; year: number }) =>
  point.day <= Temporal.PlainYearMonth.from(point).daysInMonth

/** A calendar day, month or year — as precise as the record that gave it. */
export const calendarPointSchema = z.discriminatedUnion('precision', [
  z.object({ precision: z.literal('year'), year: yearSchema }),
  z.object({
    month: monthSchema,
    precision: z.literal('month'),
    year: yearSchema
  }),
  z
    .object({
      day: z.int().min(1).max(31),
      month: monthSchema,
      precision: z.literal('day'),
      year: yearSchema
    })
    .refine(isDayInMonth, { message: 'day_out_of_month' })
])
export type CalendarPoint = z.infer<typeof calendarPointSchema>

export const POINT_QUALIFIERS = ['exact', 'about', 'before', 'after'] as const
export type PointQualifier = (typeof POINT_QUALIFIERS)[number]

/**
 * A date as old records give it: exact, approximate ("vers 1880"), bounded
 * ("avant 1902") or a range ("entre 1930 et 1935") — GEDCOM's `ABT`, `BEF`,
 * `AFT` and `BET … AND …`.
 */
export const fuzzyDateSchema = z.discriminatedUnion('qualifier', [
  z.object({
    point: calendarPointSchema,
    qualifier: z.enum(POINT_QUALIFIERS)
  }),
  z.object({
    from: calendarPointSchema,
    qualifier: z.literal('between'),
    to: calendarPointSchema
  })
])
export type FuzzyDate = z.infer<typeof fuzzyDateSchema>
