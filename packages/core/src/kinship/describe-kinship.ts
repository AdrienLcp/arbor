import type { Locale } from '@arbor/protocol/locale'

import type { Kinship } from './kinship'
import {
  describeKinshipInEnglish,
  kinshipTermInEnglish
} from './kinship-in-english'
import {
  describeKinshipInFrench,
  kinshipTermInFrench
} from './kinship-in-french'

type Names = { personName: string; relativeName: string }

const WORDING = {
  en: { describe: describeKinshipInEnglish, term: kinshipTermInEnglish },
  fr: { describe: describeKinshipInFrench, term: kinshipTermInFrench }
} satisfies Record<
  Locale,
  {
    describe: (kinship: Kinship, names: Names) => string
    term: (kinship: Kinship) => string | null
  }
>

/** The relation in one sentence, the relative first: "Michel est le demi-frère de Pierre." */
export const describeKinship = (
  kinship: Kinship,
  { locale, ...names }: Names & { locale: Locale }
): string => WORDING[locale].describe(kinship, names)

/** The relation's name alone, `null` for the same person or no known link. */
export const kinshipTerm = (kinship: Kinship, locale: Locale): string | null =>
  WORDING[locale].term(kinship)
