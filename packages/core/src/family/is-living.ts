import type { Person } from '@arbor/protocol/person'

import { earliestPlausibleDay } from '../fuzzy-date/earliest-plausible-day'

/** Past this age with no death recorded, a person is presumed dead. */
const PRESUMED_DEAD_AFTER_YEARS = 110

/**
 * Whether a person is treated as living — what decides how much of them the
 * family shares. With no birth date and no death, they are presumed living:
 * hiding too much is the safe mistake.
 */
export const isLiving = (
  person: Person,
  today: Temporal.PlainDate
): boolean => {
  if (person.livingOverride !== null) return person.livingOverride
  if (person.death !== null) return false
  const birthDate = person.birth?.date
  if (!birthDate) return true
  const presumedDeadIfBornBefore = today.subtract({
    years: PRESUMED_DEAD_AFTER_YEARS
  })
  return (
    Temporal.PlainDate.compare(
      earliestPlausibleDay(birthDate),
      presumedDeadIfBornBefore
    ) > 0
  )
}
