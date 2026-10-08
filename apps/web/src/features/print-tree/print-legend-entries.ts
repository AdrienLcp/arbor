import type { LineStyle } from '@/features/family-tree/line-style'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** One line of the legend: a sample of what the tree draws, and the words for it. */
export type LegendEntry =
  | { isEnded?: boolean; kind: 'line'; style: LineStyle; words: string }
  | { kind: 'outline'; words: string }
  | { kind: 'sign'; sign: string; words: string }

/** The legend every printed sheet carries, in the order a reader meets the marks. */
export const usePrintLegendEntries = (): readonly LegendEntry[] => {
  const translate = useTranslate()
  return [
    {
      kind: 'line',
      style: 'marriage',
      words: translate('print.legend.marriage')
    },
    {
      kind: 'line',
      style: 'free-union',
      words: translate('print.legend.freeUnion')
    },
    {
      isEnded: true,
      kind: 'line',
      style: 'marriage',
      words: translate('print.legend.ended')
    },
    { kind: 'line', style: 'plain', words: translate('print.legend.child') },
    {
      kind: 'line',
      style: 'adoption',
      words: translate('print.legend.adoption')
    },
    { kind: 'line', style: 'step', words: translate('print.legend.step') },
    {
      kind: 'line',
      style: 'unknown',
      words: translate('print.legend.unknownLink')
    },
    { kind: 'outline', words: translate('print.legend.unknownPerson') },
    { kind: 'sign', sign: '†', words: translate('print.legend.deceased') }
  ]
}
