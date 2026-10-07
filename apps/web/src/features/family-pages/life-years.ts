import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'
import type { Person } from '@arbor/protocol/person'

const DEATH_MARK = '†'

const yearOf = (date: FuzzyDate | null | undefined): number | null => {
  if (date === null || date === undefined) {
    return null
  }

  return date.qualifier === 'between' ? date.from.year : date.point.year
}

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

  const deathText = died === null ? DEATH_MARK : `${DEATH_MARK} ${died}`

  return born === null ? deathText : `${born} – ${deathText}`
}
