import { QRCodeSVG } from 'qrcode.react'
import type React from 'react'

import './qr-code.sass'

type QrCodeProps = {
  /** What the code holds, said to a screen reader. */
  label: string
  value: string
}

/** Rendered large and scaled down by its box, so it stays sharp on any screen. */
const DRAWN_SIZE = 512

/** A link as a QR code, dark on white whatever the theme: a phone camera reads it from the screen or from paper. */
export const QrCode: React.FC<QrCodeProps> = ({ label, value }) => (
  <span className='qr-code'>
    <QRCodeSVG
      bgColor='transparent'
      fgColor='currentColor'
      level='M'
      marginSize={0}
      size={DRAWN_SIZE}
      title={label}
      value={value}
    />
  </span>
)
