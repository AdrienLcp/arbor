/** The only reader of the wall clock on this device: today's date where the visitor is. */
export const today = (): Temporal.PlainDate =>
  Temporal.Instant.fromEpochMilliseconds(Date.now())
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate()
