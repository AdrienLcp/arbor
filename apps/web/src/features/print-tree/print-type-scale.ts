/** The printed side's words, in millimetres: sizes a reader at arm's length reads on paper. */
export const PRINT_TYPE_SCALE = {
  foot: { size: 3.4, tracking: 0.35 },
  heading: { size: 5, tracking: 0.2 },
  summary: { leading: 1.15, size: 4.4, tracking: 0.2 },
  text: { leading: 1.25, size: 3.7 },
  title: { leading: 0.86, smallest: 6 }
} as const
