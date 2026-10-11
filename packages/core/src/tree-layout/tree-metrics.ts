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

/** From one generation's cards to the next one's: room for the sibling bars and the union brackets. */
export const ROW_HEIGHT = 262

/** The top of the cards of a generation. */
export const rowY = (generation: number) =>
  (generation - FIRST_GENERATION) * ROW_HEIGHT

/** The width of cards laid side by side, partners apart. */
export const slotsWidth = (slotCount: number) =>
  slotCount * CARD_WIDTH + (slotCount - 1) * PARTNER_GAP

/** The left edge of a card in a row of slots starting at `left`. */
export const slotLeft = ({ index, left }: { index: number; left: number }) =>
  left + index * (CARD_WIDTH + PARTNER_GAP)
