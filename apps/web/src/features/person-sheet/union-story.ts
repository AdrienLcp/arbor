import type { Union } from '@arbor/protocol/union'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOccurrenceWords } from './occurrence-words'

/** A union told in one sentence: "Married on 7 July 1956 in Nantes, divorced in 1968". */
export const useUnionStory = (): ((union: Union) => string) => {
  const translate = useTranslate()
  const occurrence = useOccurrenceWords()

  const told = (word: string, when: string): string =>
    when === '' ? word : translate('sheet.union.told', { when, word })

  return (union) =>
    [
      told(
        translate(`sheet.union.start.${union.kind}`),
        occurrence.afterVerb(union.start)
      ),
      ...(union.end === null
        ? []
        : [
            told(
              translate(`tree.unionEnd.${union.end.kind}`),
              occurrence.afterVerb(union.end)
            )
          ])
    ].join(', ')
}
