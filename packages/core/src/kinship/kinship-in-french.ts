import type { Union } from '@arbor/protocol/union'

import { type InLawRole, inLawRoleOf } from './in-law-role'
import type { BloodTie, Kinship, KinshipPerson, Sex } from './kinship'

type FrenchNoun = { gender: 'feminine' | 'masculine'; word: string }

/**
 * The relative the relation is told through, for cousins of unequal
 * generations: "d'un cousin germain" (one of the person's cousins), "du père"
 * (the person's own father).
 */
type FrenchLink = { isOneOfSeveral: boolean; nouns: readonly FrenchNoun[] }

/** The words for one relation: a single noun, or "le frère ou la sœur" when French has no neutral one. */
type FrenchPhrase = {
  link: FrenchLink | null
  nouns: readonly FrenchNoun[]
  /** Said last: " par alliance". */
  suffix: string
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
  link: null,
  nouns,
  suffix: ''
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
  // cspell:disable-next-line
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

const saidAll = (
  nouns: readonly FrenchNoun[],
  say: (noun: FrenchNoun) => string
): string => nouns.map(say).join(' ou ')

/** The relation as it follows "est" about a named person, whose name comes next: "le cousin germain du père". */
const saidOfSomeone = ({ link, nouns, suffix }: FrenchPhrase): string => {
  const head = saidAll(nouns, (noun) => determined(noun, 'definite'))
  const linked =
    link === null
      ? ''
      : ` ${saidAll(link.nouns, (noun) =>
          determined(noun, link.isOneOfSeveral ? 'ofIndefinite' : 'ofDefinite')
        )}`
  return head + linked + suffix
}

/** The relation as it follows "est" about the visitor: "votre grand-père", "le cousin germain de votre père". */
const saidOfYou = ({ link, nouns, suffix }: FrenchPhrase): string => {
  if (link === null) {
    return saidAll(nouns, ({ word }) => `votre ${word}`) + suffix
  }
  const head = saidAll(nouns, (noun) => determined(noun, 'definite'))
  return `${head} ${saidAll(link.nouns, ({ word }) => `de votre ${word}`)}${suffix}`
}

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
    return {
      link: {
        isOneOfSeveral: true,
        nouns: prefixed(cousinNouns(up, linkSex), half)
      },
      nouns: descendantNouns(down - up, sex),
      suffix: ''
    }
  }
  return {
    link: { isOneOfSeveral: false, nouns: ancestorNouns(up - down, linkSex) },
    nouns: prefixed(cousinNouns(down, sex), half),
    suffix: ''
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
      return formerIf(kinship.isFormer, {
        ...bloodPhrase(kinship.tie, kinship.relativeSex),
        suffix: ' par alliance'
      })
    }
    default:
      return kinship satisfies never
  }
}

/** The relation with its article, as it follows "est": "la demi-sœur", "le cousin germain du père". */
export const kinshipTermInFrench = (kinship: Kinship): string | null => {
  const phrase = kinshipPhrase(kinship)
  return phrase === null ? null : saidOfSomeone(phrase)
}

const ofName = (name: string): string =>
  startsWithVowelSound(name) ? `d’${name}` : `de ${name}`

/** "Anne est la petite-fille de Louis.", "Pierre est votre grand-père.", "Vous êtes la nièce de Simone." */
export const describeKinshipInFrench = (
  kinship: Kinship,
  { person, relative }: { person: KinshipPerson; relative: KinshipPerson }
): string => {
  const phrase = kinshipPhrase(kinship)
  if (kinship.kind === 'self') return 'C’est la même personne.'
  if (person === 'you') {
    const relativeName = relative === 'you' ? '' : relative.name
    return phrase === null
      ? `${relativeName} et vous n’avez aucun lien connu dans l’arbre.`
      : `${relativeName} est ${saidOfYou(phrase)}.`
  }
  if (relative === 'you') {
    return phrase === null
      ? `Vous et ${person.name} n’avez aucun lien connu dans l’arbre.`
      : `Vous êtes ${saidOfSomeone(phrase)} ${ofName(person.name)}.`
  }
  return phrase === null
    ? `${relative.name} et ${person.name} n’ont aucun lien connu dans l’arbre.`
    : `${relative.name} est ${saidOfSomeone(phrase)} ${ofName(person.name)}.`
}
