import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { lineStyleOf } from '@/features/family-tree/line-style'
import type { PersonFace } from '@/features/family-tree/person-face'
import {
  type PlacedWords,
  useRelationWords
} from '@/features/family-tree/relation-words'
import { cutPath, pathOf } from '@/features/family-tree/tree-lines'
import type { TreeScene } from '@/features/family-tree/tree-scene'
import { useUnknownParentWords } from '@/features/family-tree/use-unknown-parent-words'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PrintContent } from './print-content'
import { CUT_WIDTH, PrintLine } from './print-line'
import { PRINT_PALETTE } from './print-palette'
import { Halftone, PrintGhostSlot, PrintSticker } from './print-sticker'
import { printedWidth } from './print-text'
import { PRINT_VOICES } from './print-voices'

/** The words on a relation line: their size and the pill around them. */
const WORD_SIZE = 13.5
const WORD_LEADING = 15
const PILL_PADDING_X = 8
const PILL_PADDING_Y = 4

/** The room the two slashes of an ended union take between its start and its end. */
const CUT_LEADING = 16

const WordsPill: React.FC<{ words: PlacedWords }> = ({ words }) => {
  const lines = words.moments.flat()
  const cutCount = words.isCut ? words.moments.length - 1 : 0
  const width =
    Math.max(
      ...lines.map((line) =>
        printedWidth({ size: WORD_SIZE, text: line, voice: 'label' })
      )
    ) +
    2 * PILL_PADDING_X
  const height =
    lines.length * WORD_LEADING + cutCount * CUT_LEADING + 2 * PILL_PADDING_Y
  const top = words.at.y - height / 2

  const placed = words.moments.reduce<{
    cuts: number[]
    lines: { text: string; y: number }[]
    y: number
  }>(
    (acc, moment, index) => {
      const cuts =
        index > 0 && words.isCut
          ? [...acc.cuts, acc.y + CUT_LEADING / 2]
          : acc.cuts
      const start = index > 0 && words.isCut ? acc.y + CUT_LEADING : acc.y
      return {
        cuts,
        lines: [
          ...acc.lines,
          ...moment.map((text, line) => ({
            text,
            y: start + (line + 1) * WORD_LEADING - 3.5
          }))
        ],
        y: start + moment.length * WORD_LEADING
      }
    },
    { cuts: [], lines: [], y: top + PILL_PADDING_Y }
  )

  return (
    <g>
      <rect
        fill={PRINT_PALETTE.paper}
        height={height}
        rx={Math.min(height / 2, width / 2)}
        stroke={PRINT_PALETTE.line}
        strokeDasharray={words.isDashed ? '4 3' : undefined}
        strokeWidth='1.5'
        width={width}
        x={words.at.x - width / 2}
        y={top}
      />
      {placed.lines.map(({ text, y }) => (
        <text
          fill={PRINT_PALETTE.ink}
          fontFamily={PRINT_VOICES.label.family}
          fontSize={WORD_SIZE}
          key={`${text}${y}`}
          textAnchor='middle'
          x={words.at.x}
          y={y}
        >
          {text}
        </text>
      ))}
      {placed.cuts.map((y) => (
        <path
          d={cutPath({ x: words.at.x, y })}
          fill='none'
          key={y}
          stroke={PRINT_PALETTE.line}
          strokeLinecap='round'
          strokeWidth={CUT_WIDTH}
        />
      ))}
    </g>
  )
}

type PrintTreeDrawingProps = {
  content: PrintContent
  faces: ReadonlyMap<EntityId, PersonFace>
  /** Prefix of the drawing's pattern ids, unique on the page. */
  idPrefix: string
  /** Where each person was born and died, as their sticker prints it. */
  places: ReadonlyMap<EntityId, string>
  /** The photos ready to embed, by photo id. */
  portraits: ReadonlyMap<EntityId, string>
  scene: TreeScene
}

/** The tree as it prints, in the layout's own coordinates: the lines, the stickers, the words on the lines. */
export const PrintTreeDrawing: React.FC<PrintTreeDrawingProps> = ({
  content,
  faces,
  idPrefix,
  places,
  portraits,
  scene
}) => {
  const translate = useTranslate()
  const wordsOf = useRelationWords({ isDated: content.hasDates })
  const unknownParentWords = useUnknownParentWords()
  const calledName = (personId: EntityId | undefined): string | null => {
    const face = personId === undefined ? undefined : faces.get(personId)
    return face === undefined ? null : face.givenNames || face.name
  }

  return (
    <g>
      <defs>
        {scene.bands.map((band) => (
          <Halftone
            generation={band.generation}
            key={band.generation}
            prefix={idPrefix}
          />
        ))}
      </defs>
      {scene.layout.connectors.map((connector) => (
        <PrintLine
          key={`${connector.kind}${pathOf(connector.points)}`}
          path={pathOf(connector.points)}
          style={lineStyleOf(connector)}
        />
      ))}
      {scene.layout.cards.map((card) => {
        if (card.kind === 'unknown-parent') {
          return (
            <PrintGhostSlot
              hint={unknownParentWords(calledName(card.childIds[0])).hint}
              key={card.key}
              title={translate('tree.unknownParent.title')}
              x={card.x}
              y={card.y}
            />
          )
        }
        const face = faces.get(card.personId)
        return face === undefined ? null : (
          <PrintSticker
            face={face}
            generation={card.generation}
            hasDates={content.hasDates}
            idPrefix={idPrefix}
            isRepeated={card.isRepeated}
            key={card.key}
            place={content.hasPlaces ? (places.get(face.id) ?? '') : ''}
            portrait={
              content.hasPhotos && face.portraitPhotoId !== null
                ? (portraits.get(face.portraitPhotoId) ?? null)
                : null
            }
            x={card.x}
            y={card.y}
          />
        )
      })}
      {scene.layout.connectors.map((connector) => {
        const words = wordsOf(connector)
        return words === null ? null : (
          <WordsPill key={words.key} words={words} />
        )
      })}
    </g>
  )
}
