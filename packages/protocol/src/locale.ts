/** The languages the app speaks; French is the reference. */
export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
