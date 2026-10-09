import type React from 'react'

import { PRINT_VOICES, type PrintVoice } from './print-voices'

type PrintLinesProps = {
  fill: string
  /** From one baseline to the next. */
  leading: number
  letterSpacing?: number
  lines: readonly string[]
  size: number
  voice: PrintVoice
  x: number
  /** The first line's baseline. */
  y: number
}

/** Lines of text set one under the other, left-aligned: a wrapped paragraph on paper, which SVG cannot wrap itself. */
export const PrintLines: React.FC<PrintLinesProps> = ({
  fill,
  leading,
  letterSpacing,
  lines,
  size,
  voice,
  x,
  y
}) =>
  lines
    .map((line, index) => ({ baseline: y + index * leading, line }))
    .map(({ baseline, line }) => (
      <text
        fill={fill}
        fontFamily={PRINT_VOICES[voice].family}
        fontSize={size}
        key={baseline}
        letterSpacing={letterSpacing}
        x={x}
        y={baseline}
      >
        {line}
      </text>
    ))
