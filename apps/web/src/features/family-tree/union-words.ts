import type { Occurrence } from '@arbor/protocol/occurrence'
import type { Union } from '@arbor/protocol/union'

import { yearOf } from '@/features/people/fuzzy-year'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** A union in words: "married" and its years, `null` when unknown or left out. */
export type UnionMoment = { word: string; years: string | null }

const yearIn = (occurrence: Occurrence | null): string | null => {
  const year = yearOf(occurrence?.date)
  return year === null ? null : String(year)
}

/**
 * A union as it stands: "married 1956", or once it ended its end alone over
 * the years it lasted, "divorced 1956–1968" — a divorced couple is not called
 * married. `isDated: false` leaves the years out.
 */
export const useUnionMoment = ({
  isDated = true
}: {
  isDated?: boolean
} = {}): ((union: Union) => UnionMoment) => {
  const translate = useTranslate()

  return (union) => {
    const startYear = isDated ? yearIn(union.start) : null
    if (union.end === null) {
      return { word: translate(`tree.union.${union.kind}`), years: startYear }
    }
    const endYear = isDated ? yearIn(union.end) : null
    const lasted = [startYear, endYear].filter((year) => year !== null)
    return {
      word: translate(`tree.unionEnd.${union.end.kind}`),
      years: lasted.length === 0 ? null : lasted.join('–')
    }
  }
}

/** A union in words on one line: "married 1956", "divorced 1956–1968", or without their years. */
export const useUnionWords = ({
  isDated = true
}: {
  isDated?: boolean
} = {}): ((union: Union) => string) => {
  const translate = useTranslate()
  const unionMoment = useUnionMoment({ isDated })

  return (union) => {
    const { word, years } = unionMoment(union)
    return years === null
      ? word
      : translate('tree.dated', { word, year: years })
  }
}
