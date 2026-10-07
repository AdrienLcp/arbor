const GENERATION_INK_COUNT = 5

/** The class that paints a generation's inks (`.g1`–`.g5`); a sixth generation cycles back to the first ink. */
export const generationClass = (generation: number): string =>
  `g${((generation - 1) % GENERATION_INK_COUNT) + 1}`
