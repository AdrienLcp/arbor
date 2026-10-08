import type React from 'react'

import type { TreePoint } from '@arbor/core/tree-layout/tree-layout'

import type { LineStyle } from '@/features/family-tree/line-style'
import { cutPath } from '@/features/family-tree/tree-lines'

import { PRINT_PALETTE } from './print-palette'

type Stroke = React.SVGProps<SVGPathElement>

/** The Line Speaks Rule on paper: the canvas's strokes, written as attributes because a PDF reads no stylesheet. */
const STROKES = {
  adoption: { strokeWidth: 6.5 },
  'free-union': {
    strokeDasharray: '7 5',
    strokeLinecap: 'butt',
    strokeWidth: 3.2
  },
  marriage: { strokeWidth: 3.2 },
  plain: { strokeWidth: 2 },
  step: { strokeDasharray: '0.1 6', strokeWidth: 2.6 },
  unknown: {
    stroke: PRINT_PALETTE.ghost,
    strokeDasharray: '3 4',
    strokeWidth: 2
  }
} as const satisfies Record<LineStyle, Stroke>

const BASE: Stroke = {
  fill: 'none',
  stroke: PRINT_PALETTE.line,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

/** The paper core of an adoption's double line, and the gap under the slashes of an ended union. */
const ADOPTION_CORE = 2.4
const CUT_GAP = 7
const CUT_WIDTH = 2.6

/** One relation line on paper, stroked for its kind; an ended union is cut with two slashes. */
export const PrintLine: React.FC<{
  /** Where an ended union is cut; `null` for a line that goes on. */
  cutAt?: TreePoint | null
  path: string
  style: LineStyle
}> = ({ cutAt = null, path, style }) => (
  <>
    <path {...BASE} {...STROKES[style]} d={path} />
    {style === 'adoption' ? (
      <path
        {...BASE}
        d={path}
        stroke={PRINT_PALETTE.paper}
        strokeWidth={ADOPTION_CORE}
      />
    ) : null}
    {cutAt === null ? null : (
      <>
        <path
          {...BASE}
          d={cutPath(cutAt)}
          stroke={PRINT_PALETTE.paper}
          strokeWidth={CUT_GAP}
        />
        <path {...BASE} d={cutPath(cutAt)} strokeWidth={CUT_WIDTH} />
      </>
    )}
  </>
)
