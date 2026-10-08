import type { Locale } from '@arbor/protocol/locale'

import type { Kinship, KinshipPerson } from './kinship'
import {
  describeKinshipInEnglish,
  kinshipTermInEnglish
} from './kinship-in-english'
import {
  describeKinshipInFrench,
  kinshipTermInFrench
} from './kinship-in-french'

/** Who the sentence is about: the relative is its subject, the person the one they are related to. */
type Names = { person: KinshipPerson; relative: KinshipPerson }

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

/** The relation in one sentence, the relative first: "Michel est le demi-frère de Pierre.", "Michel est votre demi-frère." */
export const describeKinship = (
  kinship: Kinship,
  { locale, ...names }: Names & { locale: Locale }
): string => WORDING[locale].describe(kinship, names)

/** The relation's name alone, `null` for the same person or no known link. */
export const kinshipTerm = (kinship: Kinship, locale: Locale): string | null =>
  WORDING[locale].term(kinship)
