import { textWidth } from '@/infrastructure/print-fonts'

import { PRINT_VOICES, type PrintVoice } from './print-voices'

/** How wide `text` prints in a voice at `size`, `tracking` added after each letter. */
export const printedWidth = ({
  size,
  text,
  tracking = 0,
  voice
}: {
  size: number
  text: string
  tracking?: number
  voice: PrintVoice
}): number =>
  textWidth({ family: PRINT_VOICES[voice].family, size, text }) +
  tracking * text.length

/** The size `text` is printed at so it fits `width`: `size` when it already does, never under `smallest`. */
export const fittedSize = ({
  size,
  smallest,
  text,
  tracking = 0,
  voice,
  width
}: {
  size: number
  smallest: number
  text: string
  tracking?: number
  voice: PrintVoice
  width: number
}): number => {
  const natural = printedWidth({ size, text, tracking, voice })
  return natural <= width ? size : Math.max(smallest, (size * width) / natural)
}

/** `text` broken into lines no wider than `width`, between words. A word longer than a line has a line of its own. */
export const wrappedLines = ({
  size,
  text,
  tracking = 0,
  voice,
  width
}: {
  size: number
  text: string
  tracking?: number
  voice: PrintVoice
  width: number
}): string[] => {
  const lines: string[] = []
  for (const word of text.split(/\s+/)) {
    if (word === '') continue
    const last = lines.at(-1)
    const joined = `${last} ${word}`
    if (
      last !== undefined &&
      printedWidth({ size, text: joined, tracking, voice }) <= width
    ) {
      lines[lines.length - 1] = joined
    } else {
      lines.push(word)
    }
  }
  return lines
}
