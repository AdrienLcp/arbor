import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import type { FuzzyDate } from '@arbor/protocol/fuzzy-date'
import type { Occurrence } from '@arbor/protocol/occurrence'
import type { Operation } from '@arbor/protocol/operation'
import type { Person } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import { parseFuzzyDate } from '../fuzzy-date/parse-fuzzy-date'

const dated = (text: string): FuzzyDate => {
  const date = parseFuzzyDate(text)
  if (date.status === 'failure') {
    throw new Error(`The demo family has an unreadable date: ${text}`)
  }
  return date.data
}

const at = (dateText: string, place: string | null = null): Occurrence => ({
  date: dated(dateText),
  place
})

type DemoPerson = Pick<Person, 'givenNames' | 'id' | 'sex' | 'surname'> &
  Partial<Pick<Person, 'birth' | 'birthSurname' | 'death'>>

const createPerson = ({
  birth = null,
  birthSurname = null,
  death = null,
  ...identity
}: DemoPerson): Operation => ({
  person: {
    birth,
    birthSurname,
    death,
    livingOverride: null,
    notes: '',
    portraitPhotoId: null,
    ...identity
  },
  type: 'person.create'
})

const createUnion = ({
  end = null,
  start = null,
  ...union
}: Pick<Union, 'id' | 'kind' | 'partnerIds'> &
  Partial<Pick<Union, 'end' | 'start'>>): Operation => ({
  type: 'union.create',
  union: { end, start, ...union }
})

const linkParent = ({
  childId,
  kind = 'birth',
  parentId
}: {
  childId: EntityId
  kind?: FiliationKind
  parentId: EntityId
}): Operation => ({
  filiation: { childId, id: `${parentId}--${childId}`, kind, parentId },
  type: 'filiation.create'
})

const linkBirthParents = (childId: EntityId, parentIds: EntityId[]) =>
  parentIds.map((parentId) => linkParent({ childId, parentId }))

/**
 * A fictional family over five generations, written as the change log that
 * built it. It seeds development, the end-to-end journeys and the public demo,
 * and shows every case a real family has: two marriages, half-siblings, a
 * divorce, a step-child, an adoption, a same-sex couple, unknown parents,
 * approximate dates, a corrected record, a person in the bin — and one record
 * left wrong (Marie's death, copied from her mother's) for the warnings.
 */
export const DEMO_FAMILY_OPERATIONS: readonly Operation[] = [
  createPerson({
    birth: at('ABT 1880', 'Douarnenez'),
    death: at('11 FEB 1951', 'Douarnenez'),
    givenNames: 'Auguste',
    id: 'auguste-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  createPerson({
    birth: at('14 JUN 1883', 'Pouldergat'),
    birthSurname: 'Le Goff',
    death: at('1879'),
    givenNames: 'Marie',
    id: 'marie-le-goff',
    sex: 'female',
    surname: 'Morel'
  }),
  createUnion({
    id: 'auguste-marie',
    kind: 'marriage',
    partnerIds: ['auguste-morel', 'marie-le-goff'],
    start: at('20 SEP 1904', 'Pouldergat')
  }),
  {
    event: {
      ...at('AUG 1914', 'Quimper'),
      id: 'auguste-mobilised',
      kind: 'other',
      label: 'Mobilisé au 118e régiment d’infanterie',
      personId: 'auguste-morel'
    },
    type: 'event.create'
  },
  {
    event: {
      ...at('14 FEB 1951', 'Douarnenez'),
      id: 'auguste-burial',
      kind: 'burial',
      label: null,
      personId: 'auguste-morel'
    },
    type: 'event.create'
  },
  {
    photo: {
      caption: 'Mariage d’Auguste et Marie, devant l’église de Pouldergat',
      date: dated('20 SEP 1904'),
      id: 'auguste-marie-wedding',
      personId: null
    },
    type: 'photo.create'
  },
  {
    photo: {
      caption: 'Auguste sur le port',
      date: dated('ABT 1930'),
      id: 'auguste-portrait',
      personId: 'auguste-morel'
    },
    type: 'photo.create'
  },
  {
    after: { portraitPhotoId: 'auguste-portrait' },
    before: { portraitPhotoId: null },
    personId: 'auguste-morel',
    type: 'person.update'
  },

  createPerson({
    birth: at('3 JUL 1905', 'Douarnenez'),
    death: at('1978', 'Quimper'),
    givenNames: 'Louis',
    id: 'louis-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  ...linkBirthParents('louis-morel', ['auguste-morel', 'marie-le-goff']),
  {
    event: {
      ...at('9 JUL 1905', 'Douarnenez'),
      id: 'louis-baptism',
      kind: 'baptism',
      label: null,
      personId: 'louis-morel'
    },
    type: 'event.create'
  },
  createPerson({
    birth: at('BET 1908 AND 1910', 'Douarnenez'),
    death: at('30 NOV 1990', 'Brest'),
    givenNames: 'Jeanne',
    id: 'jeanne-morel',
    sex: 'female',
    surname: 'Morel'
  }),
  ...linkBirthParents('jeanne-morel', ['auguste-morel', 'marie-le-goff']),

  createPerson({
    birth: at('ABT 1902', 'Brest'),
    givenNames: 'René',
    id: 'rene-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  linkParent({ childId: 'rene-morel', parentId: 'jeanne-morel' }),
  {
    after: { birth: at('17 APR 1932', 'Brest') },
    before: { birth: at('ABT 1902', 'Brest') },
    personId: 'rene-morel',
    type: 'person.update'
  },

  createPerson({
    birth: at('12 FEB 1910', 'Quimper'),
    birthSurname: 'Roux',
    death: at('30 MAY 1940', 'Quimper'),
    givenNames: 'Hélène',
    id: 'helene-roux',
    sex: 'female',
    surname: 'Morel'
  }),
  createUnion({
    id: 'louis-helene',
    kind: 'marriage',
    partnerIds: ['louis-morel', 'helene-roux'],
    start: at('14 JUN 1930', 'Quimper')
  }),
  createPerson({
    birth: at('1 MAR 1932', 'Quimper'),
    death: at('2019', 'Nantes'),
    givenNames: 'Pierre',
    id: 'pierre-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  ...linkBirthParents('pierre-morel', ['louis-morel', 'helene-roux']),
  createPerson({
    birth: at('8 AUG 1935', 'Quimper'),
    death: at('2010', 'Quimper'),
    givenNames: 'Simone',
    id: 'simone-morel',
    sex: 'female',
    surname: 'Morel'
  }),
  ...linkBirthParents('simone-morel', ['louis-morel', 'helene-roux']),
  createPerson({
    birth: at('1935'),
    givenNames: 'Simone',
    id: 'simone-morel-duplicate',
    sex: 'female',
    surname: 'Morel'
  }),
  { personId: 'simone-morel-duplicate', type: 'person.bin' },

  createPerson({
    birth: at('1915', 'Rennes'),
    birthSurname: 'Guérin',
    death: at('AFT 1990'),
    givenNames: 'Yvonne',
    id: 'yvonne-guerin',
    sex: 'female',
    surname: 'Morel'
  }),
  createUnion({
    id: 'louis-yvonne',
    kind: 'marriage',
    partnerIds: ['louis-morel', 'yvonne-guerin'],
    start: at('27 APR 1946', 'Rennes')
  }),
  createPerson({
    birth: at('5 OCT 1947', 'Rennes'),
    givenNames: 'Michel',
    id: 'michel-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  ...linkBirthParents('michel-morel', ['louis-morel', 'yvonne-guerin']),

  createPerson({
    birth: at('24 DEC 1934', 'Nantes'),
    givenNames: 'Claire',
    id: 'claire-dubois',
    sex: 'female',
    surname: 'Dubois'
  }),
  createUnion({
    end: { ...at('15 MAR 1968', 'Nantes'), kind: 'divorce' },
    id: 'pierre-claire',
    kind: 'marriage',
    partnerIds: ['pierre-morel', 'claire-dubois'],
    start: at('7 JUL 1956', 'Nantes')
  }),
  createPerson({
    birth: at('20 MAY 1958', 'Nantes'),
    givenNames: 'Anne',
    id: 'anne-morel',
    sex: 'female',
    surname: 'Morel'
  }),
  ...linkBirthParents('anne-morel', ['pierre-morel', 'claire-dubois']),

  createPerson({
    birth: at('9 JAN 1940', 'Angers'),
    givenNames: 'Odile',
    id: 'odile-bertin',
    sex: 'female',
    surname: 'Bertin'
  }),
  createPerson({
    birth: at('30 SEP 1965', 'Angers'),
    givenNames: 'Thomas',
    id: 'thomas-bertin',
    sex: 'male',
    surname: 'Bertin'
  }),
  linkParent({ childId: 'thomas-bertin', parentId: 'odile-bertin' }),
  createUnion({
    id: 'pierre-odile',
    kind: 'partnership',
    partnerIds: ['pierre-morel', 'odile-bertin'],
    start: at('1970', 'Angers')
  }),
  linkParent({
    childId: 'thomas-bertin',
    kind: 'step',
    parentId: 'pierre-morel'
  }),
  {
    operations: [
      createPerson({
        birth: at('4 APR 1995', 'Angers'),
        givenNames: 'Emma',
        id: 'emma-bertin',
        sex: 'female',
        surname: 'Bertin'
      }),
      linkParent({ childId: 'emma-bertin', parentId: 'thomas-bertin' })
    ],
    type: 'group'
  },

  createPerson({
    birth: at('3 MAR 1949', 'Rennes'),
    givenNames: 'Françoise',
    id: 'francoise-lambert',
    sex: 'female',
    surname: 'Lambert'
  }),
  createUnion({
    id: 'michel-francoise',
    kind: 'marriage',
    partnerIds: ['michel-morel', 'francoise-lambert'],
    start: at('9 SEP 1972', 'Rennes')
  }),
  createPerson({
    birth: at('1 JUN 1975', 'Marseille'),
    givenNames: 'Karim',
    id: 'karim-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  linkParent({
    childId: 'karim-morel',
    kind: 'adoption',
    parentId: 'michel-morel'
  }),
  linkParent({
    childId: 'karim-morel',
    kind: 'adoption',
    parentId: 'francoise-lambert'
  }),
  createPerson({
    birth: at('1977', 'Marseille'),
    givenNames: 'Inès',
    id: 'ines-roche',
    sex: 'female',
    surname: 'Roche'
  }),
  createUnion({
    id: 'karim-ines',
    kind: 'marriage',
    partnerIds: ['karim-morel', 'ines-roche'],
    start: at('2004', 'Marseille')
  }),
  createPerson({
    birth: at('19 AUG 2006', 'Marseille'),
    givenNames: 'Noah',
    id: 'noah-morel',
    sex: 'male',
    surname: 'Morel'
  }),
  ...linkBirthParents('noah-morel', ['karim-morel', 'ines-roche']),

  createPerson({
    birth: at('11 NOV 1960', 'Lyon'),
    givenNames: 'Sophie',
    id: 'sophie-garnier',
    sex: 'female',
    surname: 'Garnier'
  }),
  createUnion({
    id: 'anne-sophie',
    kind: 'pacs',
    partnerIds: ['anne-morel', 'sophie-garnier'],
    start: at('12 MAY 2001', 'Lyon')
  }),
  createPerson({
    birth: at('14 FEB 2003', 'Lyon'),
    givenNames: 'Lucie',
    id: 'lucie-morel',
    sex: 'female',
    surname: 'Morel'
  }),
  linkParent({ childId: 'lucie-morel', parentId: 'anne-morel' }),
  {
    after: { kind: 'marriage', start: at('21 JUN 2014', 'Lyon') },
    before: { kind: 'pacs', start: at('12 MAY 2001', 'Lyon') },
    type: 'union.update',
    unionId: 'anne-sophie'
  },
  linkParent({
    childId: 'lucie-morel',
    kind: 'adoption',
    parentId: 'sophie-garnier'
  })
]
