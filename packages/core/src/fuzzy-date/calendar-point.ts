import type { CalendarPoint } from '@arbor/protocol/fuzzy-date'

const FIRST_MONTH = 1
const LAST_MONTH = 12
const FIRST_DAY = 1

export const firstDayOf = (point: CalendarPoint): Temporal.PlainDate => {
  switch (point.precision) {
    case 'year':
      return Temporal.PlainDate.from({
        day: FIRST_DAY,
        month: FIRST_MONTH,
        year: point.year
      })
    case 'month':
      return Temporal.PlainDate.from({ ...point, day: FIRST_DAY })
    case 'day':
      return Temporal.PlainDate.from(point)
  }
}

export const lastDayOf = (point: CalendarPoint): Temporal.PlainDate => {
  switch (point.precision) {
    case 'year':
      return lastDayOf({
        month: LAST_MONTH,
        precision: 'month',
        year: point.year
      })
    case 'month':
      return Temporal.PlainYearMonth.from(point).toPlainDate({
        day: Temporal.PlainYearMonth.from(point).daysInMonth
      })
    case 'day':
      return Temporal.PlainDate.from(point)
  }
}
