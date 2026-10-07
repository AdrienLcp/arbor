import { FIRST_GENERATION } from '../family/generation-numbers'

/** A sticker's slot on the desktop canvas, as `apps/web/DESIGN.md` sizes it. */
export const CARD_WIDTH = 112
export const CARD_HEIGHT = 150

/** Between two partners: room for the union line and its word. */
export const PARTNER_GAP = 40

/** Between the blocks of two siblings; cousins get twice as much. */
export const SIBLING_BLOCK_GAP = 40

/** From one generation's cards to the next one's: room for the sibling bars and the slot numbers. */
export const ROW_HEIGHT = 280

/** The top of the cards of a generation. */
export const rowY = (generation: number) =>
  (generation - FIRST_GENERATION) * ROW_HEIGHT

/** The width of cards laid side by side, partners apart. */
export const slotsWidth = (slotCount: number) =>
  slotCount * CARD_WIDTH + (slotCount - 1) * PARTNER_GAP

/** The left edge of a card in a row of slots starting at `left`. */
export const slotLeft = ({ index, left }: { index: number; left: number }) =>
  left + index * (CARD_WIDTH + PARTNER_GAP)
