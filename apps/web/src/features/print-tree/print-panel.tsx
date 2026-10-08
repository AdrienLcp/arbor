import { QRCodeSVG } from 'qrcode.react'
import type React from 'react'

import type { LineStyle } from '@/features/family-tree/line-style'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { PrintLine } from './print-line'
import { PrintLines } from './print-lines'
import type { Rect } from './print-pages'
import { PRINT_PALETTE } from './print-palette'
import { fittedSize, wrappedLines } from './print-text'
import { PRINT_VOICES } from './print-voices'

/** The panel's words, in millimetres: sizes a reader at arm's length reads on paper. */
const TITLE_MAX = 24
const TITLE_LEADING = 0.86
const SUMMARY_SIZE = 4.4
const SUMMARY_TRACKING = 0.2
const HEADING_SIZE = 5
const LEGEND_SIZE = 3.7
const LEGEND_LEADING = 1.25
const LEGEND_SAMPLE_WIDTH = 13
const LEGEND_GAP = 3.2
const QR_SIZE = 24
const FOOT_SIZE = 3.4

type LegendEntry =
  | { isEnded?: boolean; kind: 'line'; style: LineStyle; words: string }
  | { kind: 'outline'; words: string }
  | { kind: 'sign'; sign: string; words: string }

type PrintPanelProps = {
  familyName: string
  /** The link the QR code opens: the reader link, never the family link; `null` prints no code. */
  liveLink: string | null
  panel: Rect
  printedOn: Temporal.PlainDate
  summary: string
  /** Millimetres per screen pixel of the tree, so the legend's lines are the tree's own. */
  treeScale: number
}

/** The sheet's side: the family's name, what the tree holds, the legend every printed sheet carries, the way back to the live tree. */
export const PrintPanel: React.FC<PrintPanelProps> = ({
  familyName,
  liveLink,
  panel,
  printedOn,
  summary,
  treeScale
}) => {
  const translate = useTranslate()
  const { width, x } = panel
  const legend: readonly LegendEntry[] = [
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

  const titleLines = familyName.toLocaleUpperCase().split(/\s+/)
  const titleSize = Math.min(
    ...titleLines.map((line) =>
      fittedSize({
        size: TITLE_MAX,
        smallest: 6,
        text: line,
        voice: 'heading',
        width
      })
    )
  )
  let y = panel.y + titleSize * 0.8
  const titleTop = y
  y += (titleLines.length - 1) * titleSize * TITLE_LEADING + SUMMARY_SIZE * 2

  const summaryLines = wrappedLines({
    size: SUMMARY_SIZE,
    text: summary.toLocaleUpperCase(),
    tracking: SUMMARY_TRACKING,
    voice: 'label',
    width
  })
  const summaryTop = y
  y += summaryLines.length * SUMMARY_SIZE * 1.15 + HEADING_SIZE * 1.6

  const legendTop = y
  const legendText = width - LEGEND_SAMPLE_WIDTH - LEGEND_GAP
  y += HEADING_SIZE * 0.9
  const rows = legend.map((entry) => {
    const lines = wrappedLines({
      size: LEGEND_SIZE,
      text: entry.words,
      voice: 'text',
      width: legendText
    })
    const top = y + LEGEND_SIZE * 0.6
    y += lines.length * LEGEND_SIZE * LEGEND_LEADING + LEGEND_SIZE * 0.55
    return { entry, lines, top }
  })

  const middleOf = (top: number, lineCount: number) =>
    top + (lineCount * LEGEND_SIZE * LEGEND_LEADING) / 2 - LEGEND_SIZE * 0.35

  const sample = (entry: LegendEntry, middle: number) => {
    switch (entry.kind) {
      case 'line': {
        const length = LEGEND_SAMPLE_WIDTH / treeScale
        return (
          <g transform={`translate(${x} ${middle}) scale(${treeScale})`}>
            <PrintLine
              cutAt={entry.isEnded ? { x: length / 2, y: 0 } : null}
              path={`M0 0H${length}`}
              style={entry.style}
            />
          </g>
        )
      }
      case 'outline':
        return (
          <rect
            fill={PRINT_PALETTE.paper2}
            height='5'
            rx='1'
            stroke={PRINT_PALETTE.ghost}
            strokeDasharray='1.2 0.8'
            strokeWidth='0.45'
            width='7'
            x={x + 3}
            y={middle - 2.5}
          />
        )
      case 'sign':
        return (
          <text
            fill={PRINT_PALETTE.ink}
            fontFamily={PRINT_VOICES.heading.family}
            fontSize='5'
            textAnchor='middle'
            x={x + LEGEND_SAMPLE_WIDTH / 2}
            y={middle + 1.8}
          >
            {entry.sign}
          </text>
        )
      default:
        return entry satisfies never
    }
  }

  const footTop = panel.y + panel.height
  const qrTop = footTop - FOOT_SIZE * 2.4 - QR_SIZE
  const qrText = x + QR_SIZE + 4
  const qrLines = wrappedLines({
    size: LEGEND_SIZE,
    text: translate('print.live.text'),
    voice: 'text',
    width: width - QR_SIZE - 4
  })

  return (
    <g>
      <PrintLines
        fill={PRINT_PALETTE.ink}
        leading={titleSize * TITLE_LEADING}
        lines={titleLines}
        size={titleSize}
        voice='heading'
        x={x}
        y={titleTop}
      />
      <PrintLines
        fill={PRINT_PALETTE.inkSoft}
        leading={SUMMARY_SIZE * 1.15}
        letterSpacing={SUMMARY_TRACKING}
        lines={summaryLines}
        size={SUMMARY_SIZE}
        voice='label'
        x={x}
        y={summaryTop}
      />
      <text
        fill={PRINT_PALETTE.ink}
        fontFamily={PRINT_VOICES.heading.family}
        fontSize={HEADING_SIZE}
        letterSpacing='0.2'
        x={x}
        y={legendTop}
      >
        {translate('print.legend.title').toLocaleUpperCase()}
      </text>
      <path
        d={`M${x} ${legendTop + 1.8}H${x + width}`}
        stroke={PRINT_PALETTE.ink}
        strokeWidth='0.4'
      />
      {rows.map(({ entry, lines, top }) => (
        <g key={entry.words}>
          {sample(entry, middleOf(top, lines.length))}
          <PrintLines
            fill={PRINT_PALETTE.ink}
            leading={LEGEND_SIZE * LEGEND_LEADING}
            lines={lines}
            size={LEGEND_SIZE}
            voice='text'
            x={x + LEGEND_SAMPLE_WIDTH + LEGEND_GAP}
            y={top + LEGEND_SIZE * 0.5}
          />
        </g>
      ))}
      {liveLink === null ? null : (
        <g>
          <QRCodeSVG
            bgColor={PRINT_PALETTE.paper}
            fgColor={PRINT_PALETTE.ink}
            level='M'
            marginSize={0}
            size={QR_SIZE}
            value={liveLink}
            x={x}
            y={qrTop}
          />
          <text
            fill={PRINT_PALETTE.ink}
            fontFamily={PRINT_VOICES.heading.family}
            fontSize={HEADING_SIZE}
            x={qrText}
            y={qrTop + HEADING_SIZE}
          >
            {translate('print.live.title').toLocaleUpperCase()}
          </text>
          <PrintLines
            fill={PRINT_PALETTE.ink}
            leading={LEGEND_SIZE * LEGEND_LEADING}
            lines={qrLines}
            size={LEGEND_SIZE}
            voice='text'
            x={qrText}
            y={qrTop + HEADING_SIZE * 2.1}
          />
        </g>
      )}
      <text
        fill={PRINT_PALETTE.inkSoft}
        fontFamily={PRINT_VOICES.label.family}
        fontSize={FOOT_SIZE}
        letterSpacing='0.35'
        x={x}
        y={footTop - 0.6}
      >
        {translate('print.printedOn', { day: printedOn }).toLocaleUpperCase()}
      </text>
    </g>
  )
}
