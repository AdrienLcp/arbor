import type { Locale } from '@arbor/protocol/locale'

/** The regional tag react-aria keeps its own strings for — a date picker's labels — per locale the app speaks. */
export const REGIONAL_LOCALES = {
  en: 'en-US',
  fr: 'fr-FR'
} as const satisfies Record<Locale, string>
