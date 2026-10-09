import { today } from '@/infrastructure/clock'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** How the history reads the moment of an entry, on this device's own clock. */
export type EntryClock = {
  /** The day the entry was made here, as `2026-10-08`: entries of one day share it. */
  dayKeyOf: (at: string) => string
  /** "Today", "Yesterday", or the day in words. */
  dayLabelOf: (dayKey: string) => string
  /** "14:32". */
  timeOf: (at: string) => string
  /** "8 October 2026 at 14:32", for an entry named outside its day. */
  momentOf: (at: string) => string
}

const dayOf = (at: string): Temporal.PlainDate =>
  Temporal.Instant.from(at)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate()

export const useEntryClock = (): EntryClock => {
  const translate = useTranslate()
  const now = today()

  return {
    dayKeyOf: (at) => dayOf(at).toString(),
    dayLabelOf: (dayKey) => {
      const day = Temporal.PlainDate.from(dayKey)
      const daysAgo = day.until(now).days
      if (daysAgo === 0) return translate('history.today')
      if (daysAgo === 1) return translate('history.yesterday')
      return day.year === now.year
        ? translate('history.day', { day })
        : translate('history.dayOfYear', { day })
    },
    momentOf: (at) =>
      translate('history.moment', { at: Temporal.Instant.from(at) }),
    timeOf: (at) => translate('history.time', { at: Temporal.Instant.from(at) })
  }
}
