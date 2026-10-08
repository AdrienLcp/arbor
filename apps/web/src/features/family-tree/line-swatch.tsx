import type React from 'react'

import type { LineStyle } from './line-style'
import { cutPath, RelationLine } from './tree-lines'

import './line-swatch.sass'

type LineSwatchProps = {
  height: number
  /** Cuts the line with two slashes: a union that ended in a divorce or a separation. */
  isEnded?: boolean
  style: LineStyle
  width: number
}

/** A short piece of relation line beside its words, stroked as on the canvas, so a phone page tells link kinds the same way. */
export const LineSwatch: React.FC<LineSwatchProps> = ({
  height,
  isEnded = false,
  style,
  width
}) => {
  const middle = { x: width / 2, y: height / 2 }

  return (
    <svg
      aria-hidden='true'
      className='line-swatch'
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <RelationLine path={`M0 ${middle.y}H${width}`} style={style} />
      {isEnded ? (
        <>
          <path className='tree-line cut-gap' d={cutPath(middle)} />
          <path className='tree-line cut' d={cutPath(middle)} />
        </>
      ) : null}
    </svg>
  )
}
