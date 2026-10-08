import type { Occurrence } from '@arbor/protocol/occurrence'
import type { Union } from '@arbor/protocol/union'

import { yearOf } from '@/features/people/fuzzy-year'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** A union in words, one line each for its start and its end: "married 1956", "divorced 1968", or without their years. */
export const useUnionWords = ({
  isDated = true
}: {
  isDated?: boolean
} = {}): ((union: Union) => string[]) => {
  const translate = useTranslate()

  const dated = (word: string, occurrence: Occurrence | null): string => {
    const year = isDated ? yearOf(occurrence?.date) : null
    return year === null
      ? word
      : translate('tree.dated', { word, year: String(year) })
  }

  return (union) => [
    dated(translate(`tree.union.${union.kind}`), union.start),
    ...(union.end === null
      ? []
      : [dated(translate(`tree.unionEnd.${union.end.kind}`), union.end)])
  ]
}
