import { CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

/** The sticker's inner margin, in screen pixels as the layout counts them. */
export const STICKER_PADDING = 5

/** The coloured box at the top of a sticker, holding the monogram or the photo. */
export const STICKER_ART = {
  height: 66,
  width: CARD_WIDTH - 2 * STICKER_PADDING
} as const
