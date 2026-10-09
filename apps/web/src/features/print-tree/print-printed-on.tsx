import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { PRINT_PALETTE } from './print-palette'
import { PRINT_TYPE_SCALE } from './print-type-scale'
import { PRINT_VOICES } from './print-voices'

const { foot } = PRINT_TYPE_SCALE

type PrintPrintedOnProps = {
  day: Temporal.PlainDate
  x: number
  /** The bottom of the printed side: the line sits on it. */
  y: number
}

/** The day the sheet was printed, so two sheets on a wall tell which is newer. */
export const PrintPrintedOn: React.FC<PrintPrintedOnProps> = ({
  day,
  x,
  y
}) => {
  const translate = useTranslate()
  return (
    <text
      fill={PRINT_PALETTE.inkSoft}
      fontFamily={PRINT_VOICES.label.family}
      fontSize={foot.size}
      letterSpacing={foot.tracking}
      x={x}
      y={y - 0.6}
    >
      {translate('print.printedOn', { day }).toLocaleUpperCase()}
    </text>
  )
}
