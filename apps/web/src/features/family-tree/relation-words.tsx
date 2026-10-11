import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { Fragment } from 'react'

import type {
  TreeConnector,
  TreePoint
} from '@arbor/core/tree-layout/tree-layout'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { tellingFiliationKind } from './line-style'
import { cutPath } from './tree-lines'
import type { TreeScene } from './tree-scene'
import { isBetweenNeighbours, unionMiddle } from './union-marks'
import { useUnionMoments } from './union-words'

/** Above a child's card, where the word of an adoption or a step-child hangs on the line. */
const DESCENT_WORDS_ABOVE_CARD = 40

/** The two slashes of an ended union, drawn inside its pill between its start and its end. */
const CUT_MARK_WIDTH = 16
const CUT_MARK_HEIGHT = 16

export type PlacedWords = {
  at: TreePoint
  /** The union ended: its pill parts its start from its end with the two slashes of a cut line. */
  isCut: boolean
  isDashed: boolean
  key: string
  /** One group per moment, "married 1956" then "divorced 1968"; a group of two lines sets the year under its word. */
  moments: readonly (readonly string[])[]
}

/** The words a relation line carries and where they sit, `null` for a line that carries none. `isDated: false` leaves the unions' years out. */
export const useRelationWords = ({
  isDated = true
}: {
  isDated?: boolean
} = {}) => {
  const translate = useTranslate()
  const unionMoments = useUnionMoments({ isDated })

  return (connector: TreeConnector): PlacedWords | null => {
    switch (connector.kind) {
      case 'union': {
        if (connector.union === null) return null
        const isStacked = isBetweenNeighbours(connector.points)
        return {
          at: unionMiddle(connector.points),
          isCut: connector.union.end !== null,
          isDashed: connector.union.kind === 'partnership',
          key: connector.union.id,
          moments: unionMoments(connector.union).map(({ word, year }) => {
            if (year === null) return [word]
            return isStacked
              ? [word, year]
              : [translate('tree.dated', { word, year })]
          })
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
          isCut: false,
          isDashed: false,
          key: `descent-${connector.childId}-${child.x}-${child.y}`,
          moments: [[translate(`tree.descent.${kind}`)]]
        }
      }
      case 'siblings':
        return null
      default:
        return connector satisfies never
    }
  }
}

const CutMark: React.FC = () => (
  <svg
    aria-hidden='true'
    className='relation-words-cut'
    height={CUT_MARK_HEIGHT}
    width={CUT_MARK_WIDTH}
  >
    <path
      className='tree-line cut'
      d={cutPath({ x: CUT_MARK_WIDTH / 2, y: CUT_MARK_HEIGHT / 2 })}
    />
  </svg>
)

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
        {words.moments.map((lines, index) => (
          <Fragment key={lines.join(' ')}>
            {index > 0 && words.isCut ? <CutMark /> : null}
            {lines.map((line) => (
              <span className='relation-words-line' key={line}>
                {line}
              </span>
            ))}
          </Fragment>
        ))}
      </span>
    )
  })
}
