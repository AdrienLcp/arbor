import { Result } from '@adrienlcp/result'

/** A moment as stored and sent: RFC 3339 in UTC, milliseconds kept so stored text sorts as time does. */
export const toIsoString = (instant: Temporal.Instant): string =>
  instant.toString({ smallestUnit: 'millisecond' })

/** Reads back a moment this server wrote. */
export const parseInstant = (
  text: string
): Result<Temporal.Instant, 'invalid_instant'> => {
  try {
    return Result.success(Temporal.Instant.from(text))
  } catch {
    return Result.failure('invalid_instant')
  }
}

/** The calendar day of a moment, in UTC: the day the living-or-not rule counts from. */
export const utcDayOf = (instant: Temporal.Instant): Temporal.PlainDate =>
  instant.toZonedDateTimeISO('UTC').toPlainDate()
