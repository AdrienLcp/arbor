import { classNames } from '@adrienlcp/react'
import type React from 'react'

import type {
  TreeConnector,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { tellingFiliationKind } from './line-style'
import type { TreeScene } from './tree-scene'
import { isBetweenNeighbours, unionMiddle } from './union-marks'
import { useUnionMoment } from './union-words'

/** Above a child's card, where the word of an adoption or a step-child hangs on the line. */
const DESCENT_WORDS_ABOVE_CARD = 40

export type PlacedWords = {
  at: TreePoint
  isDashed: boolean
  key: string
  /** "married 1956" on one line, or its word over its years between partners side by side. */
  lines: readonly string[]
}

/** The words a relation line carries and where they sit, `null` for a line that carries none. `isDated: false` leaves the unions' years out. */
export const useRelationWords = ({
  isDated = true
}: {
  isDated?: boolean
} = {}) => {
  const translate = useTranslate()
  const unionMoment = useUnionMoment({ isDated })

  return (connector: TreeConnector): PlacedWords | null => {
    switch (connector.kind) {
      case 'union': {
        if (connector.union === null) return null
        const { word, years } = unionMoment(connector.union)
        const isStacked = isBetweenNeighbours(connector.points)
        return {
          at: unionMiddle(connector.points),
          isDashed: connector.union.kind === 'partnership',
          key: connector.union.id,
          lines:
            years === null
              ? [word]
              : isStacked
                ? [word, years]
                : [translate('tree.dated', { word, year: years })]
        }
      }
      case 'descent': {
        const kind = tellingFiliationKind(connector.filiations)
        const child = connector.points.at(-1)
        if (
          child === undefined ||
          (kind !== 'adoption' && kind !== 'step' && kind !== 'foster')
        ) {
          return null
        }
        return {
          at: { x: child.x, y: child.y - DESCENT_WORDS_ABOVE_CARD },
          isDashed: false,
          key: `descent-${connector.childId}-${child.x}-${child.y}`,
          lines: [translate(`tree.descent.${kind}`)]
        }
      }
      case 'siblings':
        return null
      default:
        return connector satisfies never
    }
  }
}

/** The words on the relation lines — "married 1957", "adoption" — so a link reads without its stroke. */
export const RelationWords: React.FC<{ scene: TreeScene }> = ({ scene }) => {
  const wordsOf = useRelationWords()

  return scene.layout.connectors.map((connector) => {
    const words = wordsOf(connector)
    if (words === null) return null

    return (
      <span
        aria-hidden='true'
        className={classNames('relation-words', words.isDashed && 'dashed')}
        key={words.key}
        style={{
          '--x': `${words.at.x - scene.origin.x}px`,
          '--y': `${words.at.y - scene.origin.y}px`
        }}
      >
        {words.lines.map((line) => (
          <span className='relation-words-line' key={line}>
            {line}
          </span>
        ))}
      </span>
    )
  })
}
