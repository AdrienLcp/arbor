import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import {
  LEGEND_COLUMN_GAP,
  LEGEND_SAMPLE_WIDTH,
  type LegendColumns
} from './legend-columns'
import type { LegendEntry } from './print-legend-entries'
import { PrintLine } from './print-line'
import { PrintLines } from './print-lines'
import { PRINT_PALETTE } from './print-palette'
import { PRINT_TYPE_SCALE } from './print-type-scale'
import { PRINT_VOICES } from './print-voices'

const { heading, text } = PRINT_TYPE_SCALE

type PrintLegendProps = {
  legend: LegendColumns
  /** Millimetres per screen pixel of the tree, so the legend's lines are the tree's own. */
  treeScale: number
  width: number
  x: number
  /** The heading's baseline. */
  y: number
}

/** The legend under its heading: a sample of each mark the tree draws, beside its words. */
export const PrintLegend: React.FC<PrintLegendProps> = ({
  legend,
  treeScale,
  width,
  x,
  y
}) => {
  const translate = useTranslate()

  const sample = (entry: LegendEntry, left: number, middle: number) => {
    switch (entry.kind) {
      case 'line': {
        const length = LEGEND_SAMPLE_WIDTH / treeScale
        return (
          <g transform={`translate(${left} ${middle}) scale(${treeScale})`}>
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
            x={left + 3}
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
            x={left + LEGEND_SAMPLE_WIDTH / 2}
            y={middle + 1.8}
          >
            {entry.sign}
          </text>
        )
      default:
        return entry satisfies never
    }
  }

  return (
    <g>
      <text
        fill={PRINT_PALETTE.ink}
        fontFamily={PRINT_VOICES.heading.family}
        fontSize={heading.size}
        letterSpacing={heading.tracking}
        x={x}
        y={y}
      >
        {translate('print.legend.title').toLocaleUpperCase()}
      </text>
      <path
        d={`M${x} ${y + 1.8}H${x + width}`}
        stroke={PRINT_PALETTE.ink}
        strokeWidth='0.4'
      />
      {legend.columns.map((rows, column) => {
        const left = x + column * (legend.columnWidth + LEGEND_COLUMN_GAP)
        return rows.map(({ entry, lines, top }) => {
          const rowTop = y + top
          const middle =
            rowTop +
            (lines.length * text.size * text.leading) / 2 -
            text.size * 0.35
          return (
            <g key={entry.words}>
              {sample(entry, left, middle)}
              <PrintLines
                fill={PRINT_PALETTE.ink}
                leading={text.size * text.leading}
                lines={lines}
                size={text.size}
                voice='text'
                x={left + legend.textOffset}
                y={rowTop + text.size * 0.5}
              />
            </g>
          )
        })
      })}
    </g>
  )
}
