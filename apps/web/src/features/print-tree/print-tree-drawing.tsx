import type React from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { TreeConnector } from '@arbor/core/tree-layout/tree-layout'

import { lineStyleOf } from '@/features/family-tree/line-style'
import type { PersonFace } from '@/features/family-tree/person-face'
import {
  type PlacedWords,
  useRelationWords
} from '@/features/family-tree/relation-words'
import { pathOf } from '@/features/family-tree/tree-lines'
import type {
  GenerationBand,
  TreeScene
} from '@/features/family-tree/tree-scene'
import {
  unionMiddle,
  unionWordsPlace
} from '@/features/family-tree/union-marks'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { PrintLine } from './print-line'
import { generationInks, PRINT_PALETTE } from './print-palette'
import { Halftone, PrintGhostSlot, PrintSticker } from './print-sticker'
import { printedWidth } from './print-text'
import { PRINT_VOICES } from './print-voices'

/** A band's tint and its top rule: its generation's ink, faint (The Generation Ink Rule). */
const BAND_TINT = 0.09
const BAND_RULE = 0.55
/** The slanted head of a band's rail: its size, its cut, its distance from the band's corner. */
const RAIL_INSET = 18
const RAIL_HEAD_WIDTH = 150
const RAIL_HEAD_HEIGHT = 30
const RAIL_HEAD_CUT = 14
/** The words on a relation line: their size and the pill around them. */
const WORD_SIZE = 13.5
const WORD_LEADING = 15
const PILL_PADDING_X = 8
const PILL_PADDING_Y = 4

const BandStrip: React.FC<{ band: GenerationBand; scene: TreeScene }> = ({
  band,
  scene
}) => {
  const { fill } = generationInks(band.generation)
  const left = scene.origin.x
  const right = scene.origin.x + scene.width

  return (
    <>
      <rect
        fill={fill}
        fillOpacity={BAND_TINT}
        height={band.bottom - band.top}
        width={scene.width}
        x={left}
        y={band.top}
      />
      <path
        d={`M${left} ${band.top}H${right}`}
        stroke={fill}
        strokeOpacity={BAND_RULE}
        strokeWidth='2'
      />
    </>
  )
}

const BandRail: React.FC<{ band: GenerationBand; scene: TreeScene }> = ({
  band,
  scene
}) => {
  const translate = useTranslate()
  const inks = generationInks(band.generation)
  const x = scene.origin.x + RAIL_INSET
  const y = band.top + RAIL_INSET
  const years =
    band.births === null
      ? null
      : band.births.first === band.births.last
        ? String(band.births.first)
        : translate('tree.years', {
            first: String(band.births.first),
            last: String(band.births.last)
          })
  const counts = [
    translate('tree.people', { count: band.personCount }),
    ...(band.missingCount === 0
      ? []
      : [translate('tree.missing', { count: band.missingCount })])
  ]

  return (
    <g>
      <path
        d={`M${x} ${y}h${RAIL_HEAD_WIDTH}l${-RAIL_HEAD_CUT} ${RAIL_HEAD_HEIGHT}H${x}z`}
        fill={inks.fill}
      />
      <text
        fill={inks.on}
        fontFamily={PRINT_VOICES.heading.family}
        fontSize='18'
        letterSpacing='0.6'
        x={x + 10}
        y={y + 21.5}
      >
        {translate('tree.generation', {
          number: band.generation
        }).toLocaleUpperCase()}
      </text>
      {years === null ? null : (
        <text
          fill={PRINT_PALETTE.ink}
          fontFamily={PRINT_VOICES.labelBold.family}
          fontSize='16'
          x={x}
          y={y + RAIL_HEAD_HEIGHT + 22}
        >
          {years}
        </text>
      )}
      {counts.map((count, index) => (
        <text
          fill={inks.ink}
          fontFamily={PRINT_VOICES.label.family}
          fontSize='13.5'
          key={count}
          letterSpacing='0.6'
          x={x}
          y={y + RAIL_HEAD_HEIGHT + 42 + index * 17}
        >
          {count.toLocaleUpperCase()}
        </text>
      ))}
    </g>
  )
}

const ConnectorLine: React.FC<{ connector: TreeConnector }> = ({
  connector
}) => {
  const isEnded =
    connector.kind === 'union' &&
    connector.union !== null &&
    connector.union.end !== null
  const stub =
    connector.kind === 'union' && connector.union !== null
      ? unionWordsPlace(connector.points).stub
      : null

  return (
    <>
      <PrintLine
        cutAt={isEnded ? unionMiddle(connector.points) : null}
        path={pathOf(connector.points)}
        style={lineStyleOf(connector)}
      />
      {stub === null ? null : <PrintLine path={pathOf(stub)} style='plain' />}
    </>
  )
}

const WordsPill: React.FC<{ words: PlacedWords }> = ({ words }) => {
  const width =
    Math.max(
      ...words.lines.map((line) =>
        printedWidth({ size: WORD_SIZE, text: line, voice: 'label' })
      )
    ) +
    2 * PILL_PADDING_X
  const height = words.lines.length * WORD_LEADING + 2 * PILL_PADDING_Y
  const top = words.at.y - height / 2

  return (
    <g>
      <rect
        fill={PRINT_PALETTE.paper}
        height={height}
        rx={height / 2}
        stroke={PRINT_PALETTE.line}
        strokeDasharray={words.isDashed ? '4 3' : undefined}
        strokeWidth='1.5'
        width={width}
        x={words.at.x - width / 2}
        y={top}
      />
      {words.lines.map((line, index) => (
        <text
          fill={PRINT_PALETTE.ink}
          fontFamily={PRINT_VOICES.label.family}
          fontSize={WORD_SIZE}
          key={line}
          textAnchor='middle'
          x={words.at.x}
          y={top + PILL_PADDING_Y + (index + 1) * WORD_LEADING - 3.5}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

type PrintTreeDrawingProps = {
  faces: ReadonlyMap<EntityId, PersonFace>
  /** Prefix of the drawing's pattern ids, unique on the page. */
  idPrefix: string
  scene: TreeScene
  /** The number printed above each card's slot. */
  slotNumbers: ReadonlyMap<string, number>
}

/** The tree as it prints, in the layout's own coordinates: bands and their rails, the lines, the stickers, the words on the lines. */
export const PrintTreeDrawing: React.FC<PrintTreeDrawingProps> = ({
  faces,
  idPrefix,
  scene,
  slotNumbers
}) => {
  const translate = useTranslate()
  const wordsOf = useRelationWords()

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
      {scene.bands.map((band) => (
        <BandStrip band={band} key={band.generation} scene={scene} />
      ))}
      {scene.bands.map((band) => (
        <BandRail band={band} key={band.generation} scene={scene} />
      ))}
      {scene.layout.connectors.map((connector) => (
        <ConnectorLine
          connector={connector}
          key={`${connector.kind}${pathOf(connector.points)}`}
        />
      ))}
      {scene.layout.cards.map((card) => {
        const slotNumber = slotNumbers.get(card.key) ?? 0
        if (card.kind === 'unknown-parent') {
          return (
            <PrintGhostSlot
              generation={card.generation}
              hint={translate('tree.unknownParent.hint')}
              key={card.key}
              slotNumber={slotNumber}
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
            idPrefix={idPrefix}
            isRepeated={card.isRepeated}
            key={card.key}
            slotNumber={slotNumber}
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
