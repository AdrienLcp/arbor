/**
 * The light palette of DESIGN.md in sRGB, for the printed sheet: a PDF reads
 * no `oklch()`, and the sheet is light whatever the screen theme. Each value
 * is the `_tokens.sass` light value converted; change both together.
 */
export const PRINT_PALETTE = {
  ghost: '#75828f',
  ghostSoft: '#c3ccd3',
  ink: '#161f30',
  inkSoft: '#444d5e',
  line: '#293345',
  matte: '#707274',
  paper: '#ffffff',
  paper2: '#e4ecf0',
  sticker: '#fefdfc',
  stickerEdge: '#d3d8dc'
} as const

/** A generation's three inks on paper: its fill, the text on it, its ink as text. */
export type GenerationInks = { fill: string; ink: string; on: string }

const OLDEST_INKS: GenerationInks = {
  fill: '#eab444',
  ink: '#7e4f04',
  on: '#331f05'
}

const GENERATION_INKS: readonly GenerationInks[] = [
  OLDEST_INKS,
  { fill: '#c12b11', ink: '#af2208', on: '#fdfbf9' },
  { fill: '#0b7252', ink: '#076246', on: '#fdfbf9' },
  { fill: '#2855ad', ink: '#224fa7', on: '#fdfbf9' },
  { fill: '#972767', ink: '#912061', on: '#fdfbf9' }
]

/** A generation's inks, counted from 1; a sixth generation cycles back to the first, as on screen. */
export const generationInks = (generation: number): GenerationInks =>
  GENERATION_INKS[(generation - 1) % GENERATION_INKS.length] ?? OLDEST_INKS

const channelsOf = (hex: string): number[] =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16))

/** `from` mixed with `share` of `to`, in sRGB: the dulled art of a deceased person's sticker. */
export const mixColors = (from: string, to: string, share: number): string => {
  const target = channelsOf(to)
  return `#${channelsOf(from)
    .map((channel, index) =>
      Math.round(channel + ((target[index] ?? channel) - channel) * share)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}
