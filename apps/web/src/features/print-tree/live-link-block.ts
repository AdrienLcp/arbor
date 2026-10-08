import { wrappedLines } from './print-text'
import { PRINT_TYPE_SCALE } from './print-type-scale'

/** The QR code's side, in millimetres: large enough for an old phone's camera at arm's length. */
export const QR_SIZE = 24
const QR_TEXT_GAP = 4

const { heading, text } = PRINT_TYPE_SCALE

/** The QR code and its words, measured: the words beside the code, wrapped to what `width` leaves them. */
export type LiveLinkBlock = {
  height: number
  lines: string[]
  /** From the block's left edge to its words. */
  textOffset: number
  /** From the block's top to the first line of words. */
  textTop: number
}

export const liveLinkBlock = ({
  words,
  width
}: {
  words: string
  width: number
}): LiveLinkBlock => {
  const textOffset = QR_SIZE + QR_TEXT_GAP
  const lines = wrappedLines({
    size: text.size,
    text: words,
    voice: 'text',
    width: width - textOffset
  })
  const textTop = heading.size * 2.1
  const lastBaseline = textTop + (lines.length - 1) * text.size * text.leading
  return {
    height: Math.max(QR_SIZE, lastBaseline + text.size * 0.3),
    lines,
    textOffset,
    textTop
  }
}
