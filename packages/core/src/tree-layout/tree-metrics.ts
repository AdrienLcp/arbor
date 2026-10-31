import { FIRST_GENERATION } from '../family/generation-numbers'

/** A sticker's slot on the desktop canvas, as `apps/web/DESIGN.md` sizes it. */
export const CARD_WIDTH = 112
export const CARD_HEIGHT = 150

/** The widest pill a union's words fill between two partners, each word over its year: "union libre", "civil union". */
export const UNION_WORDS_WIDTH = 72

/** How much of the union line shows on each side of its pill, so the pill reads as sitting on a line. */
const UNION_LINE_SHOWING = 12

/** Between two partners: the union line, its pill in the middle. */
export const PARTNER_GAP = UNION_WORDS_WIDTH + 2 * UNION_LINE_SHOWING

/** Between the blocks of two siblings; cousins get twice as much. */
export const SIBLING_BLOCK_GAP = 40

/** Between two families drawn side by side on one canvas: the family and the one someone married in from. */
export const FAMILIES_GAP = SIBLING_BLOCK_GAP * 4

/** From one generation's cards to the next one's: room for the sibling bars and the union brackets. */
export const ROW_HEIGHT = 262

/** The top of the cards of a generation. */
export const rowY = (generation: number) =>
  (generation - FIRST_GENERATION) * ROW_HEIGHT

/**
 * How much wider than `PARTNER_GAP` each gap between two cards of a row is,
 * by gap index — the gap after the first card first. A missing entry is none.
 */
export type ExtraGaps = readonly number[]

const extraUpTo = (extraGaps: ExtraGaps, gapCount: number) =>
  extraGaps.slice(0, gapCount).reduce((total, extra) => total + extra, 0)

/** The width of cards laid side by side, partners apart. */
export const slotsWidth = (slotCount: number, extraGaps: ExtraGaps = []) =>
  slotCount * CARD_WIDTH +
  (slotCount - 1) * PARTNER_GAP +
  extraUpTo(extraGaps, slotCount - 1)

/** The left edge of a card in a row of slots starting at `left`. */
export const slotLeft = ({
  extraGaps = [],
  index,
  left
}: {
  extraGaps?: ExtraGaps
  index: number
  left: number
}) => left + index * (CARD_WIDTH + PARTNER_GAP) + extraUpTo(extraGaps, index)
