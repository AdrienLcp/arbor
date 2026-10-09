import type { Locale } from '@arbor/protocol/locale'

/** Letters a French name can start with that elide the "de" or "que" before it; "h" is mute in names. */
const ELIDING_LETTERS: ReadonlySet<string> = new Set([
  'a',
  'e',
  'h',
  'i',
  'o',
  'u',
  'y'
])

/** The first letter without its accent: "É" reads as "e". */
const bareStart = (words: string): string =>
  words
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trimStart()

/**
 * "of" a name, the way the sentence's language writes it: "d’Anne Morel" but
 * "de Pierre Morel" in French, where a name starting with a vowel sound elides
 * the "de"; "of Anne Morel" in English.
 */
const elides = (words: string): boolean =>
  ELIDING_LETTERS.has(bareStart(words).charAt(0).toLowerCase())

export const ofName = (locale: Locale, words: string): string => {
  if (locale === 'en') return `of ${words}`
  return elides(words) ? `d’${words}` : `de ${words}`
}

/** "that" a name: "qu’Anne Morel" but "que Pierre Morel" in French; "that Anne Morel" in English. */
export const thatName = (locale: Locale, words: string): string => {
  if (locale === 'en') return `that ${words}`
  return elides(words) ? `qu’${words}` : `que ${words}`
}
