import { QRCodeSVG } from 'qrcode.react'
import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type LiveLinkBlock, QR_SIZE } from './live-link-block'
import { PrintLines } from './print-lines'
import { PRINT_PALETTE } from './print-palette'
import { PRINT_TYPE_SCALE } from './print-type-scale'
import { PRINT_VOICES } from './print-voices'

const { heading, text } = PRINT_TYPE_SCALE

type PrintLiveLinkProps = {
  block: LiveLinkBlock
  /** The link the code opens: the reader link, never the family link. */
  link: string
  x: number
  /** The block's top. */
  y: number
}

/** The way back from paper to the live tree: a QR code a phone's camera opens, and the words that say so. */
export const PrintLiveLink: React.FC<PrintLiveLinkProps> = ({
  block,
  link,
  x,
  y
}) => {
  const translate = useTranslate()
  const textX = x + block.textOffset

  return (
    <g>
      <QRCodeSVG
        bgColor={PRINT_PALETTE.paper}
        fgColor={PRINT_PALETTE.ink}
        level='M'
        marginSize={0}
        size={QR_SIZE}
        value={link}
        x={x}
        y={y}
      />
      <text
        fill={PRINT_PALETTE.ink}
        fontFamily={PRINT_VOICES.heading.family}
        fontSize={heading.size}
        x={textX}
        y={y + heading.size}
      >
        {translate('print.live.title').toLocaleUpperCase()}
      </text>
      <PrintLines
        fill={PRINT_PALETTE.ink}
        leading={text.size * text.leading}
        lines={block.lines}
        size={text.size}
        voice='text'
        x={textX}
        y={y + block.textTop}
      />
    </g>
  )
}
