import { describe, expect, it } from 'vitest'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Operation } from '@arbor/protocol/operation'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import { familyLineage } from '../tree-layout/family-lineage'
import { describeKinship, kinshipTerm } from './describe-kinship'
import { kinStepsAlong } from './kin-steps'
import type { KinshipSources } from './kinship'
import { kinshipBetween } from './kinship-between'

/** Anne and Sophie's second child, recorded without a sex. */
const CAMILLE: readonly Operation[] = [
  {
    person: {
      birth: null,
      birthSurname: null,
      death: null,
      givenNames: 'Camille',
      id: 'camille-morel',
      livingOverride: null,
      notes: '',
      portraitPhotoId: null,
      sex: 'unknown',
      surname: 'Morel'
    },
    type: 'person.create'
  },
  {
    filiation: {
      childId: 'camille-morel',
      id: 'anne-morel--camille-morel',
      kind: 'birth',
      parentId: 'anne-morel'
    },
    type: 'filiation.create'
  },
  {
    filiation: {
      childId: 'camille-morel',
      id: 'sophie-garnier--camille-morel',
      kind: 'adoption',
      parentId: 'sophie-garnier'
    },
    type: 'filiation.create'
  }
]

const demoSources = (): KinshipSources => {
  const family = replayOperations([...DEMO_FAMILY_OPERATIONS, ...CAMILLE])
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return {
    lineage: familyLineage(family.data),
    sexOf: (personId) => family.data.persons.get(personId)?.sex ?? 'unknown'
  }
}

const kinshipOf = (personId: EntityId, relativeId: EntityId) =>
  kinshipBetween(demoSources(), { personId, relativeId })

/** [person, relative, what the relative is to the person in French, in English] */
const NAMED_PAIRS: readonly [EntityId, EntityId, string, string][] = [
  ['louis-morel', 'auguste-morel', 'le père', 'father'],
  ['louis-morel', 'marie-le-goff', 'la mère', 'mother'],
  ['auguste-morel', 'jeanne-morel', 'la fille', 'daughter'],
  ['auguste-morel', 'pierre-morel', 'le petit-fils', 'grandson'],
  [
    'auguste-morel',
    'anne-morel',
    'l’arrière-petite-fille',
    'great-granddaughter'
  ],
  [
    'auguste-morel',
    'lucie-morel',
    'l’arrière-arrière-petite-fille',
    'great-great-granddaughter'
  ],
  [
    'noah-morel',
    'auguste-morel',
    'l’arrière-arrière-grand-père',
    'great-great-grandfather'
  ],
  ['michel-morel', 'karim-morel', 'le fils', 'son'],
  ['sophie-garnier', 'lucie-morel', 'la fille', 'daughter'],
  ['pierre-morel', 'simone-morel', 'la sœur', 'sister'],
  ['pierre-morel', 'michel-morel', 'le demi-frère', 'half-brother'],
  ['michel-morel', 'simone-morel', 'la demi-sœur', 'half-sister'],
  ['pierre-morel', 'jeanne-morel', 'la tante', 'aunt'],
  ['anne-morel', 'jeanne-morel', 'la grand-tante', 'great-aunt'],
  ['jeanne-morel', 'anne-morel', 'la petite-nièce', 'great-niece'],
  ['simone-morel', 'anne-morel', 'la nièce', 'niece'],
  ['michel-morel', 'anne-morel', 'la demi-nièce', 'half-niece'],
  ['anne-morel', 'michel-morel', 'le demi-oncle', 'half-uncle'],
  ['pierre-morel', 'rene-morel', 'le cousin germain', 'first cousin'],
  [
    'anne-morel',
    'rene-morel',
    'le cousin germain du père',
    'first cousin once removed'
  ],
  [
    'rene-morel',
    'anne-morel',
    'la fille d’un cousin germain',
    'first cousin once removed'
  ],
  [
    'lucie-morel',
    'rene-morel',
    'le cousin germain du grand-père',
    'first cousin twice removed'
  ],
  ['anne-morel', 'karim-morel', 'le demi-cousin germain', 'half first cousin'],
  [
    'anne-morel',
    'noah-morel',
    'le fils d’un demi-cousin germain',
    'half first cousin once removed'
  ],
  [
    'noah-morel',
    'lucie-morel',
    'la demi-cousine issue de germain',
    'half second cousin'
  ],
  ['pierre-morel', 'claire-dubois', 'l’ex-femme', 'ex-wife'],
  ['pierre-morel', 'odile-bertin', 'la compagne', 'partner'],
  ['anne-morel', 'sophie-garnier', 'la femme', 'wife'],
  ['pierre-morel', 'thomas-bertin', 'le beau-fils', 'stepson'],
  ['thomas-bertin', 'pierre-morel', 'le beau-père', 'stepfather'],
  ['odile-bertin', 'anne-morel', 'la belle-fille', 'stepdaughter'],
  ['michel-morel', 'odile-bertin', 'la belle-sœur', 'sister-in-law'],
  ['michel-morel', 'claire-dubois', 'l’ex-belle-sœur', 'former sister-in-law'],
  ['claire-dubois', 'louis-morel', 'l’ex-beau-père', 'former father-in-law'],
  [
    'louis-morel',
    'claire-dubois',
    'l’ex-belle-fille',
    'former daughter-in-law'
  ],
  ['noah-morel', 'ines-roche', 'la mère', 'mother'],
  ['karim-morel', 'ines-roche', 'la femme', 'wife'],
  ['louis-morel', 'francoise-lambert', 'la belle-fille', 'daughter-in-law'],
  [
    'auguste-morel',
    'sophie-garnier',
    'l’arrière-petite-fille par alliance',
    'great-granddaughter by marriage'
  ],
  [
    'michel-morel',
    'thomas-bertin',
    'le neveu par alliance',
    'nephew by marriage'
  ],
  [
    'pierre-morel',
    'emma-bertin',
    'la petite-fille par alliance',
    'granddaughter by marriage'
  ],
  ['thomas-bertin', 'anne-morel', 'la sœur par alliance', 'sister by marriage'],
  ['pierre-morel', 'ines-roche', 'la nièce par alliance', 'niece by marriage'],
  ['lucie-morel', 'camille-morel', 'le frère ou la sœur', 'sibling'],
  ['pierre-morel', 'camille-morel', 'le petit-enfant', 'grandchild'],
  [
    'simone-morel',
    'camille-morel',
    'le petit-neveu ou la petite-nièce',
    'great-nephew or great-niece'
  ]
]

describe('[kinship] naming a relation', () => {
  it.each(NAMED_PAIRS)(
    '[kinship] to %s, %s is %s',
    (personId, relativeId, french, english) => {
      const kinship = kinshipOf(personId, relativeId)

      expect(kinshipTerm(kinship, 'fr')).toBe(french)
      expect(kinshipTerm(kinship, 'en')).toBe(english)
    }
  )

  it('[kinship] tells a full sentence, eliding before a vowel', () => {
    const names = { person: { name: 'Anne' }, relative: { name: 'Pierre' } }
    const kinship = kinshipOf('anne-morel', 'pierre-morel')

    expect(describeKinship(kinship, { ...names, locale: 'fr' })).toBe(
      'Pierre est le père d’Anne.'
    )
    expect(describeKinship(kinship, { ...names, locale: 'en' })).toBe(
      'Pierre is Anne’s father.'
    )
  })

  it.each([
    [
      'lucie-morel',
      'pierre-morel',
      'Pierre',
      'Pierre est votre grand-père.',
      'Pierre is your grandfather.'
    ],
    [
      'anne-morel',
      'rene-morel',
      'René',
      'René est le cousin germain de votre père.',
      'René is your first cousin once removed.'
    ],
    [
      'rene-morel',
      'anne-morel',
      'Anne',
      'Anne est la fille de votre cousin germain.',
      'Anne is your first cousin once removed.'
    ],
    [
      'auguste-morel',
      'sophie-garnier',
      'Sophie',
      'Sophie est votre arrière-petite-fille par alliance.',
      'Sophie is your great-granddaughter by marriage.'
    ],
    [
      'emma-bertin',
      'noah-morel',
      'Noah',
      'Noah et vous n’avez aucun lien connu dans l’arbre.',
      'Noah and you have no known link in the tree.'
    ]
  ])(
    '[kinship] speaks to the visitor about their own relation to %s’s %s',
    (personId, relativeId, relativeName, french, english) => {
      const kinship = kinshipOf(personId, relativeId)
      const told = { person: 'you' as const, relative: { name: relativeName } }

      expect(describeKinship(kinship, { ...told, locale: 'fr' })).toBe(french)
      expect(describeKinship(kinship, { ...told, locale: 'en' })).toBe(english)
    }
  )

  it('[kinship] speaks to the visitor about their own place on someone else’s side', () => {
    const kinship = kinshipOf('thomas-bertin', 'lucie-morel')
    const told = { person: { name: 'Thomas' }, relative: 'you' as const }

    expect(describeKinship(kinship, { ...told, locale: 'fr' })).toBe(
      'Vous êtes la nièce par alliance de Thomas.'
    )
    expect(describeKinship(kinship, { ...told, locale: 'en' })).toBe(
      'You are Thomas’s niece by marriage.'
    )
  })

  it('[kinship] says so when two people have no known link', () => {
    const kinship = kinshipOf('emma-bertin', 'noah-morel')

    expect(kinship.kind).toBe('unrelated')
    expect(
      describeKinship(kinship, {
        locale: 'fr',
        person: { name: 'Emma' },
        relative: { name: 'Noah' }
      })
    ).toBe('Noah et Emma n’ont aucun lien connu dans l’arbre.')
  })

  it('[kinship] ignores a person in the bin', () => {
    expect(kinshipOf('pierre-morel', 'simone-morel-duplicate').kind).toBe(
      'unrelated'
    )
  })
})

describe('[kinship] the path to light up', () => {
  it('[kinship] tells each move along the path: up, down, across', () => {
    const kinship = kinshipOf('michel-morel', 'claire-dubois')
    const path = kinship.kind === 'in-law' ? kinship.tie.path : []

    expect(
      kinStepsAlong(demoSources().lineage, path).map((step) =>
        step.direction === 'across'
          ? [step.direction, step.union?.id]
          : [step.direction, step.filiation.kind]
      )
    ).toEqual([
      ['up', 'birth'],
      ['down', 'birth'],
      ['across', 'pierre-claire']
    ])
  })

  it('[kinship] climbs to the shared ancestor and down the other side', () => {
    const kinship = kinshipOf('anne-morel', 'rene-morel')

    expect(kinship.kind === 'blood' && kinship.tie.path).toEqual([
      'anne-morel',
      'pierre-morel',
      'louis-morel',
      'auguste-morel',
      'jeanne-morel',
      'rene-morel'
    ])
  })

  it('[kinship] crosses through the partner of a relation by marriage', () => {
    const kinship = kinshipOf('michel-morel', 'odile-bertin')

    expect(kinship.kind === 'in-law' && kinship.tie.path).toEqual([
      'michel-morel',
      'louis-morel',
      'pierre-morel',
      'odile-bertin'
    ])
  })
})
