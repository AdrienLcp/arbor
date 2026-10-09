import type { Orientation, PrintFormat } from './print-pages'

/** The papers offered: a home printer's A4 and A3, a poster of A4 sheets, and a print shop's A2 and A1. */
export const PAPER_CHOICES = ['a4', 'a3', 'poster', 'a2', 'a1'] as const
export type PaperChoice = (typeof PAPER_CHOICES)[number]

/** The sheets a print shop prints, which a home printer cannot. */
export const isShopPaper = (paper: PaperChoice): boolean =>
  paper === 'a2' || paper === 'a1'

/** The format a paper and a direction make; a poster turns its whole assembly, three sheets across or three down. */
export const printFormatOf = (
  paper: PaperChoice,
  orientation: Orientation
): PrintFormat => {
  if (paper !== 'poster') {
    return { kind: 'sheet', orientation, paper }
  }

  return orientation === 'landscape'
    ? { columns: 3, kind: 'poster', orientation, rows: 2 }
    : { columns: 2, kind: 'poster', orientation, rows: 3 }
}
