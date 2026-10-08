import type { Union } from '@arbor/protocol/union'

import { type InLawRole, inLawRoleOf } from './in-law-role'
import type { BloodTie, Kinship, Sex } from './kinship'

type FrenchNoun = { gender: 'feminine' | 'masculine'; word: string }

/** The words for one relation: a single noun, or "le frère ou la sœur" when French has no neutral one. */
type FrenchPhrase = {
  /** Said after the noun: "d'un cousin germain", "par alliance". */
  complement: string
  nouns: readonly FrenchNoun[]
}

type GenderedWords = { feminine: string; masculine: string; neutral?: string }

type Determiner = 'definite' | 'ofDefinite' | 'ofIndefinite'

const GREAT = 'arrière-'

const nounsFor = (
  sex: Sex,
  { feminine, masculine, neutral }: GenderedWords
): FrenchNoun[] => {
  const feminineNoun: FrenchNoun = { gender: 'feminine', word: feminine }
  const masculineNoun: FrenchNoun = { gender: 'masculine', word: masculine }
  if (sex === 'female') return [feminineNoun]
  if (sex === 'male') return [masculineNoun]
  return neutral === undefined
    ? [masculineNoun, feminineNoun]
    : [{ gender: 'masculine', word: neutral }]
}

const prefixed = (nouns: readonly FrenchNoun[], prefix: string): FrenchNoun[] =>
  nouns.map((noun) => ({ ...noun, word: prefix + noun.word }))

const phraseOf = (nouns: readonly FrenchNoun[]): FrenchPhrase => ({
  complement: '',
  nouns
})

const greatTimes = (count: number): string => GREAT.repeat(Math.max(0, count))

const ancestorNouns = (generations: number, sex: Sex): FrenchNoun[] =>
  generations === 1
    ? nounsFor(sex, { feminine: 'mère', masculine: 'père', neutral: 'parent' })
    : prefixed(
        nounsFor(sex, {
          feminine: 'grand-mère',
          masculine: 'grand-père',
          neutral: 'grand-parent'
        }),
        greatTimes(generations - 2)
      )

const descendantNouns = (generations: number, sex: Sex): FrenchNoun[] =>
  generations === 1
    ? nounsFor(sex, { feminine: 'fille', masculine: 'fils', neutral: 'enfant' })
    : prefixed(
        nounsFor(sex, {
          feminine: 'petite-fille',
          masculine: 'petit-fils',
          neutral: 'petit-enfant'
        }),
        greatTimes(generations - 2)
      )

const uncleNouns = (up: number, sex: Sex): FrenchNoun[] =>
  up === 2
    ? nounsFor(sex, { feminine: 'tante', masculine: 'oncle' })
    : prefixed(
        nounsFor(sex, { feminine: 'grand-tante', masculine: 'grand-oncle' }),
        greatTimes(up - 3)
      )

const nephewNouns = (down: number, sex: Sex): FrenchNoun[] =>
  down === 2
    ? nounsFor(sex, { feminine: 'nièce', masculine: 'neveu' })
    : prefixed(
        nounsFor(sex, { feminine: 'petite-nièce', masculine: 'petit-neveu' }),
        greatTimes(down - 3)
      )

/** `generations` up to the shared ancestors on each side: 2 for "cousin germain". */
const cousinNouns = (generations: number, sex: Sex): FrenchNoun[] => {
  if (generations === 2) {
    return nounsFor(sex, {
      feminine: 'cousine germaine',
      masculine: 'cousin germain'
    })
  }
  if (generations === 3) {
    return nounsFor(sex, {
      feminine: 'cousine issue de germain',
      masculine: 'cousin issu de germain'
    })
  }
  return nounsFor(sex, {
    feminine: `cousine au ${generations - 1}e degré`,
    masculine: `cousin au ${generations - 1}e degré`
  })
}

const SIBLING_WORDS: GenderedWords = { feminine: 'sœur', masculine: 'frère' }

const IN_LAW_WORDS = {
  'child-in-law': { feminine: 'belle-fille', masculine: 'gendre' },
  'foster-child': {
    feminine: 'enfant accueillie',
    masculine: 'enfant accueilli',
    neutral: 'enfant accueilli'
  },
  'foster-parent': {
    feminine: 'mère d’accueil',
    masculine: 'père d’accueil',
    neutral: 'parent d’accueil'
  },
  'parent-in-law': {
    feminine: 'belle-mère',
    masculine: 'beau-père',
    neutral: 'beau-parent'
  },
  'sibling-in-law': { feminine: 'belle-sœur', masculine: 'beau-frère' },
  'step-child': { feminine: 'belle-fille', masculine: 'beau-fils' },
  'step-parent': {
    feminine: 'belle-mère',
    masculine: 'beau-père',
    neutral: 'beau-parent'
  }
} satisfies Record<InLawRole, GenderedWords>

const PARTNER_WORDS = {
  marriage: { feminine: 'femme', masculine: 'mari', neutral: 'conjoint' },
  pacs: {
    feminine: 'partenaire de PACS',
    masculine: 'partenaire de PACS',
    neutral: 'partenaire de PACS'
  },
  partnership: { feminine: 'compagne', masculine: 'compagnon' },
  unknown: { feminine: 'compagne', masculine: 'compagnon' }
} satisfies Record<Union['kind'], GenderedWords>

/** Whether a word takes "l'" rather than "le" or "la": a vowel or a mute h. */
const startsWithVowelSound = (word: string): boolean =>
  /^[aeiouyhàâäéèêëîïôöùûüœæ]/iu.test(word)

const determined = (
  { gender, word }: FrenchNoun,
  determiner: Determiner
): string => {
  const isFeminine = gender === 'feminine'
  switch (determiner) {
    case 'definite':
      if (startsWithVowelSound(word)) return `l’${word}`
      return `${isFeminine ? 'la' : 'le'} ${word}`
    case 'ofDefinite':
      if (startsWithVowelSound(word)) return `de l’${word}`
      return `${isFeminine ? 'de la' : 'du'} ${word}`
    case 'ofIndefinite':
      return `${isFeminine ? 'd’une' : 'd’un'} ${word}`
    default:
      return determiner satisfies never
  }
}

const said = (
  { complement, nouns }: FrenchPhrase,
  determiner: Determiner
): string =>
  nouns.map((noun) => determined(noun, determiner)).join(' ou ') + complement

const bloodPhrase = (
  { degree: { down, up }, isHalf, removedLinkSex }: BloodTie,
  sex: Sex
): FrenchPhrase => {
  const half = isHalf ? 'demi-' : ''
  const linkSex = removedLinkSex ?? 'unknown'

  if (up === 0) return phraseOf(descendantNouns(down, sex))
  if (down === 0) return phraseOf(ancestorNouns(up, sex))
  if (up === 1 && down === 1) {
    return phraseOf(prefixed(nounsFor(sex, SIBLING_WORDS), half))
  }
  if (up === 1) return phraseOf(prefixed(nephewNouns(down, sex), half))
  if (down === 1) return phraseOf(prefixed(uncleNouns(up, sex), half))
  if (up === down) return phraseOf(prefixed(cousinNouns(up, sex), half))
  if (down > up) {
    const cousin = phraseOf(prefixed(cousinNouns(up, linkSex), half))
    return {
      complement: ` ${said(cousin, 'ofIndefinite')}`,
      nouns: descendantNouns(down - up, sex)
    }
  }
  const ancestor = phraseOf(ancestorNouns(up - down, linkSex))
  return {
    complement: ` ${said(ancestor, 'ofDefinite')}`,
    nouns: prefixed(cousinNouns(down, sex), half)
  }
}

const formerIf = (isFormer: boolean, phrase: FrenchPhrase): FrenchPhrase =>
  isFormer ? { ...phrase, nouns: prefixed(phrase.nouns, 'ex-') } : phrase

const kinshipPhrase = (kinship: Kinship): FrenchPhrase | null => {
  switch (kinship.kind) {
    case 'self':
    case 'unrelated':
      return null
    case 'partner':
      return formerIf(
        kinship.union.end !== null,
        phraseOf(
          nounsFor(kinship.relativeSex, PARTNER_WORDS[kinship.union.kind])
        )
      )
    case 'blood':
      return bloodPhrase(kinship.tie, kinship.relativeSex)
    case 'in-law': {
      const role = inLawRoleOf(kinship)
      if (role !== null) {
        return formerIf(
          kinship.isFormer,
          phraseOf(nounsFor(kinship.relativeSex, IN_LAW_WORDS[role]))
        )
      }
      const asBlood = bloodPhrase(kinship.tie, kinship.relativeSex)
      return formerIf(kinship.isFormer, {
        ...asBlood,
        complement: `${asBlood.complement} par alliance`
      })
    }
    default:
      return kinship satisfies never
  }
}

/** The relation with its article, as it follows "est": "la demi-sœur", "le cousin germain du père". */
export const kinshipTermInFrench = (kinship: Kinship): string | null => {
  const phrase = kinshipPhrase(kinship)
  return phrase === null ? null : said(phrase, 'definite')
}

const ofName = (name: string): string =>
  startsWithVowelSound(name) ? `d’${name}` : `de ${name}`

/** "Anne est la petite-fille de Louis." */
export const describeKinshipInFrench = (
  kinship: Kinship,
  { personName, relativeName }: { personName: string; relativeName: string }
): string => {
  if (kinship.kind === 'self') return 'C’est la même personne.'
  const term = kinshipTermInFrench(kinship)
  return term === null
    ? `${relativeName} et ${personName} n’ont aucun lien connu dans l’arbre.`
    : `${relativeName} est ${term} ${ofName(personName)}.`
}
