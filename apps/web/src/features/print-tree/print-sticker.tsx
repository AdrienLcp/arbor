import type React from 'react'

import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import type { PersonFace } from '@/features/family-tree/person-face'
import { slotNumberText } from '@/presentation/components/slot-number'

import { generationInks, mixColors, PRINT_PALETTE } from './print-palette'
import { fittedSize } from './print-text'
import { PRINT_VOICES } from './print-voices'

/** The sticker's insides, in screen pixels as the layout counts them; the sheet scales them all at once. */
const PADDING = 5
const ART_HEIGHT = 66
const CAPTION_WIDTH = CARD_WIDTH - 2 * PADDING - 2
const CENTRE = CARD_WIDTH / 2
/** A deceased person's art, dulled toward grey (The Matte Means Gone Rule). */
const MATTE_SHARE = 0.58
/** The slot number, just above the slot. */
const NUMBER_ABOVE = 8

/** The halftone pattern of a generation's art, declared once per sheet. */
export const halftoneId = (prefix: string, generation: number): string =>
  `${prefix}-dots-${generation}`

/** The halftone dots printed on a living person's sticker art, one pattern per generation. */
export const Halftone: React.FC<{ generation: number; prefix: string }> = ({
  generation,
  prefix
}) => (
  <pattern
    height='5'
    id={halftoneId(prefix, generation)}
    patternUnits='userSpaceOnUse'
    width='5'
  >
    <circle
      cx='2.5'
      cy='2.5'
      fill={generationInks(generation).on}
      fillOpacity='0.22'
      r='0.9'
    />
  </pattern>
)

type Spot = { generation: number; slotNumber: number; x: number; y: number }

const SlotNumber: React.FC<Spot> = ({ generation, slotNumber, x, y }) => (
  <text
    fill={generationInks(generation).ink}
    fontFamily={PRINT_VOICES.labelBold.family}
    fontSize='15'
    x={x}
    y={y - NUMBER_ABOVE}
  >
    {slotNumberText(slotNumber)}
  </text>
)

type CentredLine = {
  fill: string
  /** The size the line is printed at when it fits. */
  size: number
  smallest: number
  text: string
  tracking?: number
  voice: keyof typeof PRINT_VOICES
  y: number
}

const CaptionLine: React.FC<CentredLine & { x: number }> = ({
  fill,
  size,
  smallest,
  text,
  tracking = 0,
  voice,
  x,
  y
}) => (
  <text
    fill={fill}
    fontFamily={PRINT_VOICES[voice].family}
    fontSize={fittedSize({
      size,
      smallest,
      text,
      tracking,
      voice,
      width: CAPTION_WIDTH
    })}
    letterSpacing={tracking === 0 ? undefined : tracking}
    textAnchor='middle'
    x={x + CENTRE}
    y={y}
  >
    {text}
  </text>
)

/** A person's sticker on paper: flat, with the screen's art, monogram and caption; matte with a rule when they have died. */
export const PrintSticker: React.FC<
  Spot & {
    face: PersonFace
    /** Prefix of the sheet's pattern ids. */
    idPrefix: string
    /** Drawn a second time elsewhere in the tree: its edge is dashed. */
    isRepeated: boolean
  }
> = ({ face, generation, idPrefix, isRepeated, slotNumber, x, y }) => {
  const inks = generationInks(generation)
  const art = face.isDeceased
    ? mixColors(inks.fill, PRINT_PALETTE.matte, MATTE_SHARE)
    : inks.fill

  return (
    <g>
      <SlotNumber generation={generation} slotNumber={slotNumber} x={x} y={y} />
      <rect
        fill={PRINT_PALETTE.sticker}
        height={CARD_HEIGHT}
        rx='7'
        stroke={isRepeated ? PRINT_PALETTE.ghost : PRINT_PALETTE.stickerEdge}
        strokeDasharray={isRepeated ? '5 4' : undefined}
        strokeWidth={isRepeated ? 1.5 : 1}
        width={CARD_WIDTH}
        x={x}
        y={y}
      />
      <rect
        fill={art}
        height={ART_HEIGHT}
        rx='4'
        width={CARD_WIDTH - 2 * PADDING}
        x={x + PADDING}
        y={y + PADDING}
      />
      {face.isDeceased ? null : (
        <rect
          fill={`url(#${halftoneId(idPrefix, generation)})`}
          height={ART_HEIGHT}
          rx='4'
          width={CARD_WIDTH - 2 * PADDING}
          x={x + PADDING}
          y={y + PADDING}
        />
      )}
      <text
        fill={inks.on}
        fontFamily={PRINT_VOICES.heading.family}
        fontSize='32'
        textAnchor='middle'
        x={x + CENTRE}
        y={y + PADDING + ART_HEIGHT / 2 + 11}
      >
        {face.monogram}
      </text>
      {face.isDeceased ? (
        <path
          d={`M${x + 16} ${y + 80}H${x + CARD_WIDTH - 16}`}
          stroke={PRINT_PALETTE.ink}
          strokeWidth='1'
        />
      ) : null}
      <CaptionLine
        fill={PRINT_PALETTE.ink}
        size={15}
        smallest={10}
        text={face.givenNames}
        voice='name'
        x={x}
        y={y + 98}
      />
      <CaptionLine
        fill={PRINT_PALETTE.inkSoft}
        size={11.5}
        smallest={8}
        text={face.surname.toLocaleUpperCase()}
        tracking={0.9}
        voice='label'
        x={x}
        y={y + 114}
      />
      {face.years === '' ? null : (
        <CaptionLine
          fill={PRINT_PALETTE.ink}
          size={13}
          smallest={8.5}
          text={face.years}
          voice='label'
          x={x}
          y={y + 133}
        />
      )}
    </g>
  )
}

/** An unknown parent's empty slot on paper: a dashed outline, its number, and who belongs there. */
export const PrintGhostSlot: React.FC<
  Spot & { hint: string; title: string }
> = ({ generation, hint, slotNumber, title, x, y }) => (
  <g>
    <SlotNumber generation={generation} slotNumber={slotNumber} x={x} y={y} />
    <rect
      fill={PRINT_PALETTE.paper2}
      height={CARD_HEIGHT}
      rx='7'
      stroke={PRINT_PALETTE.ghost}
      strokeDasharray='6 4'
      strokeWidth='2'
      width={CARD_WIDTH}
      x={x}
      y={y}
    />
    <CaptionLine
      fill={PRINT_PALETTE.inkSoft}
      size={19}
      smallest={12}
      text={title.toLocaleUpperCase()}
      voice='heading'
      x={x}
      y={y + 68}
    />
    <CaptionLine
      fill={PRINT_PALETTE.inkSoft}
      size={13}
      smallest={9}
      text={hint}
      voice='text'
      x={x}
      y={y + 88}
    />
  </g>
)
