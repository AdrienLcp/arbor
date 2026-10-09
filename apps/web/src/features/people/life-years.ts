import type { Person } from '@arbor/protocol/person'

import { yearOf } from './fuzzy-year'

export const DEATH_MARK = '†'

/** Holds a year to the mark beside it, so a narrow sticker breaks its years only after the dash. */
const NO_BREAK_SPACE = ' '

/**
 * A person's years as a list prints them: "1932 – † 2019", "1990", "† 1918".
 * A death is always marked, even when no date is known (The Matte Means Gone Rule).
 */
export const lifeYears = (
  { birth, death }: Pick<Person, 'birth' | 'death'>,
  isLiving: boolean
): string => {
  const born = yearOf(birth?.date)
  const died = yearOf(death?.date)

  if (isLiving) {
    return born === null ? '' : String(born)
  }

  const deathText =
    died === null ? DEATH_MARK : `${DEATH_MARK}${NO_BREAK_SPACE}${died}`

  return born === null ? deathText : `${born}${NO_BREAK_SPACE}– ${deathText}`
}
