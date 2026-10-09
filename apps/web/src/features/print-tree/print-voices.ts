import type { PrintFont } from '@/infrastructure/print-fonts'

/** The faces of the printed sheet, one family per weight (see `loadPrintFonts`): the two voices of DESIGN.md. */
export const PRINT_VOICES = {
  heading: {
    family: 'Arbor Print Barlow Condensed ExtraBold',
    url: '/fonts/print/barlow-condensed-extrabold.ttf'
  },
  label: {
    family: 'Arbor Print Barlow Condensed SemiBold',
    url: '/fonts/print/barlow-condensed-semibold.ttf'
  },
  labelBold: {
    family: 'Arbor Print Barlow Condensed Bold',
    url: '/fonts/print/barlow-condensed-bold.ttf'
  },
  name: {
    family: 'Arbor Print Atkinson Hyperlegible Bold',
    url: '/fonts/print/atkinson-bold.ttf'
  },
  text: {
    family: 'Arbor Print Atkinson Hyperlegible',
    url: '/fonts/print/atkinson-regular.ttf'
  }
} as const satisfies Record<string, PrintFont>

export type PrintVoice = keyof typeof PRINT_VOICES
