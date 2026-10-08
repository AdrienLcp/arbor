/** The demo starts over at night for its French visitors, when hardly anyone is in it. */
const DEMO_RESET_TIME = Temporal.PlainTime.from('03:00')
const DEMO_RESET_TIME_ZONE = 'Europe/Paris'

/** The next moment the demo family starts over, strictly after the given one. */
export const nextDemoResetAfter = (
  moment: Temporal.Instant
): Temporal.Instant => {
  const local = moment.toZonedDateTimeISO(DEMO_RESET_TIME_ZONE)
  const today = local.withPlainTime(DEMO_RESET_TIME)
  const next =
    Temporal.ZonedDateTime.compare(today, local) > 0
      ? today
      : today.add({ days: 1 }).withPlainTime(DEMO_RESET_TIME)
  return next.toInstant()
}
