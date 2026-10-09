import type { Union } from '@arbor/protocol/union'

import { type InLawRole, inLawRoleOf } from './in-law-role'
import type { BloodTie, Kinship, KinshipPerson, Sex } from './kinship'

type GenderedWords = { female: string; male: string; neutral?: string }

const wordFor = (
  sex: Sex,
  { female, male, neutral }: GenderedWords
): string => {
  if (sex === 'female') return female
  if (sex === 'male') return male
  return neutral ?? `${male} or ${female}`
}

const prefixedWords = (
  prefix: string,
  { female, male, neutral }: GenderedWords
): GenderedWords => ({
  female: prefix + female,
  male: prefix + male,
  ...(neutral === undefined ? {} : { neutral: prefix + neutral })
})

const greatTimes = (count: number): string =>
  'great-'.repeat(Math.max(0, count))

const ancestorWords = (generations: number): GenderedWords =>
  generations === 1
    ? { female: 'mother', male: 'father', neutral: 'parent' }
    : prefixedWords(greatTimes(generations - 2), {
        female: 'grandmother',
        male: 'grandfather',
        neutral: 'grandparent'
      })

const descendantWords = (generations: number): GenderedWords =>
  generations === 1
    ? { female: 'daughter', male: 'son', neutral: 'child' }
    : prefixedWords(greatTimes(generations - 2), {
        female: 'granddaughter',
        male: 'grandson',
        neutral: 'grandchild'
      })

const ORDINALS = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth'
]

const REMOVALS = ['', ' once removed', ' twice removed']

/** "first cousin", "second cousin twice removed": the rank counts the shared generations, the removal the gap between the two sides. */
const cousinWord = ({ down, up }: { down: number; up: number }): string => {
  const rank = Math.min(up, down) - 1
  const removal = Math.abs(up - down)
  const ordinal = ORDINALS[rank - 1] ?? `${rank}th`
  return `${ordinal} cousin${REMOVALS[removal] ?? ` ${removal} times removed`}`
}

const SIBLING_WORDS: GenderedWords = {
  female: 'sister',
  male: 'brother',
  neutral: 'sibling'
}

const IN_LAW_WORDS = {
  'child-in-law': {
    female: 'daughter-in-law',
    male: 'son-in-law',
    neutral: 'child-in-law'
  },
  'foster-child': {
    female: 'foster daughter',
    male: 'foster son',
    neutral: 'foster child'
  },
  'foster-parent': {
    female: 'foster mother',
    male: 'foster father',
    neutral: 'foster parent'
  },
  'parent-in-law': {
    female: 'mother-in-law',
    male: 'father-in-law',
    neutral: 'parent-in-law'
  },
  'sibling-in-law': {
    female: 'sister-in-law',
    male: 'brother-in-law',
    neutral: 'sibling-in-law'
  },
  'step-child': {
    female: 'stepdaughter',
    male: 'stepson',
    neutral: 'stepchild'
  },
  'step-parent': {
    female: 'stepmother',
    male: 'stepfather',
    neutral: 'step-parent'
  }
} satisfies Record<InLawRole, GenderedWords>

const PARTNER_WORDS = {
  marriage: { female: 'wife', male: 'husband', neutral: 'spouse' },
  pacs: {
    female: 'civil partner',
    male: 'civil partner',
    neutral: 'civil partner'
  },
  partnership: { female: 'partner', male: 'partner', neutral: 'partner' },
  unknown: { female: 'partner', male: 'partner', neutral: 'partner' }
} satisfies Record<Union['kind'], GenderedWords>

const bloodWord = ({ degree, isHalf }: BloodTie, sex: Sex): string => {
  const { down, up } = degree
  if (up === 0) return wordFor(sex, descendantWords(down))
  if (down === 0) return wordFor(sex, ancestorWords(up))

  const half = isHalf ? 'half-' : ''
  if (up === 1 && down === 1) {
    return wordFor(sex, prefixedWords(half, SIBLING_WORDS))
  }
  if (up === 1) {
    return wordFor(
      sex,
      prefixedWords(half + greatTimes(down - 2), {
        female: 'niece',
        male: 'nephew'
      })
    )
  }
  if (down === 1) {
    return wordFor(
      sex,
      prefixedWords(half + greatTimes(up - 2), {
        female: 'aunt',
        male: 'uncle'
      })
    )
  }
  return (isHalf ? 'half ' : '') + cousinWord(degree)
}

const formerIf = (isFormer: boolean, word: string): string =>
  isFormer ? `former ${word}` : word

/** The relation as it follows a possessive: "half-sister", "first cousin once removed". */
export const kinshipTermInEnglish = (kinship: Kinship): string | null => {
  switch (kinship.kind) {
    case 'self':
    case 'unrelated':
      return null
    case 'partner': {
      const word = wordFor(
        kinship.relativeSex,
        PARTNER_WORDS[kinship.union.kind]
      )
      return kinship.union.end === null ? word : `ex-${word}`
    }
    case 'blood':
      return bloodWord(kinship.tie, kinship.relativeSex)
    case 'in-law': {
      const role = inLawRoleOf(kinship)
      return formerIf(
        kinship.isFormer,
        role === null
          ? `${bloodWord(kinship.tie, kinship.relativeSex)} by marriage`
          : wordFor(kinship.relativeSex, IN_LAW_WORDS[role])
      )
    }
    default:
      return kinship satisfies never
  }
}

/** "Anne is Louis’s granddaughter.", "Pierre is your grandfather.", "You are Simone’s niece." */
export const describeKinshipInEnglish = (
  kinship: Kinship,
  { person, relative }: { person: KinshipPerson; relative: KinshipPerson }
): string => {
  if (kinship.kind === 'self') return 'That is the same person.'
  const term = kinshipTermInEnglish(kinship)
  const personName = person === 'you' ? 'you' : person.name
  const relativeName = relative === 'you' ? 'You' : relative.name
  if (term === null) {
    return `${relativeName} and ${personName} have no known link in the tree.`
  }
  const whose = person === 'you' ? 'your' : `${person.name}’s`
  return relative === 'you'
    ? `You are ${whose} ${term}.`
    : `${relativeName} is ${whose} ${term}.`
}
