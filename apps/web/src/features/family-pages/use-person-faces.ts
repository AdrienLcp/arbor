import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import { yearOf } from '@/features/people/fuzzy-year'
import { lifeYears } from '@/features/people/life-years'
import { personName } from '@/features/people/person-name'
import { today } from '@/infrastructure/clock'
import { monogramOf } from '@/presentation/components/monogram'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { listedPeople } from './family-people'

/** Everyone in the open family as the tree and the sheets print them, keyed by person. */
export const usePersonFaces = (): ReadonlyMap<EntityId, PersonFace> => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()

  return new Map(
    listedPeople(response.family, today()).map(
      ({ generation, isLiving, person }) => [
        person.id,
        {
          birthYear: yearOf(person.birth?.date),
          generation,
          givenNames: person.givenNames,
          id: person.id,
          isDeceased: !isLiving,
          monogram: monogramOf(person),
          name: personName(person) ?? translate('common.unnamedPerson'),
          portraitPhotoId: person.portraitPhotoId,
          sex: person.sex,
          surname: person.surname,
          years: lifeYears(person, isLiving)
        }
      ]
    )
  )
}
