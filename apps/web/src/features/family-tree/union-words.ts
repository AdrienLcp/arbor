import type { Occurrence } from '@arbor/protocol/occurrence'
import type { Union } from '@arbor/protocol/union'

import { yearOf } from '@/features/people/fuzzy-year'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** One moment of a union in words: "married" and its year, `null` when unknown or left out. */
export type UnionMoment = { word: string; year: string | null }

/** A union's start and, when it ended, its end: "married 1956", then "divorced 1968". `isDated: false` leaves the years out. */
export const useUnionMoments = ({
  isDated = true
}: {
  isDated?: boolean
} = {}): ((union: Union) => UnionMoment[]) => {
  const translate = useTranslate()

  const momentOf = (
    word: string,
    occurrence: Occurrence | null
  ): UnionMoment => {
    const year = isDated ? yearOf(occurrence?.date) : null
    return { word, year: year === null ? null : String(year) }
  }

  return (union) => [
    momentOf(translate(`tree.union.${union.kind}`), union.start),
    ...(union.end === null
      ? []
      : [momentOf(translate(`tree.unionEnd.${union.end.kind}`), union.end)])
  ]
}

/** A union in words, one line each for its start and its end: "married 1956", "divorced 1968", or without their years. */
export const useUnionWords = ({
  isDated = true
}: {
  isDated?: boolean
} = {}): ((union: Union) => string[]) => {
  const translate = useTranslate()
  const unionMoments = useUnionMoments({ isDated })

  return (union) =>
    unionMoments(union).map(({ word, year }) =>
      year === null ? word : translate('tree.dated', { word, year })
    )
}
