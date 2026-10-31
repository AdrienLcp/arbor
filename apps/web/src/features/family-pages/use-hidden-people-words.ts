import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import type { LastChange } from './hidden-people-provider'

/** Someone recorded with nothing known, drawn as an "Unknown" slot: named by what they are, not "No name". */
const isUnknownPerson = (face: PersonFace): boolean =>
  face.givenNames === '' &&
  face.surname === '' &&
  face.years === '' &&
  face.portraitPhotoId === null

/** The words of "Choose who to show": names joined like a sentence, and what each tick did. */
export const useHiddenPeopleWords = (
  faces: ReadonlyMap<EntityId, PersonFace>
) => {
  const translate = useTranslate()
  const wordList = useWordList()

  /** "Claire Dubois, Henri Dubois and an unknown parent": the unknown ones counted together, last. */
  const namesOf = (personIds: readonly EntityId[]): string => {
    const known = personIds.flatMap((personId) => {
      const face = faces.get(personId)
      return face === undefined || isUnknownPerson(face) ? [] : [face.name]
    })
    const unknownCount = personIds.filter((personId) => {
      const face = faces.get(personId)
      return face !== undefined && isUnknownPerson(face)
    }).length
    return wordList(
      unknownCount === 0
        ? known
        : [
            ...known,
            translate('tree.choose.unknownParents', { count: unknownCount })
          ]
    )
  }

  const sentenceOf = (change: LastChange): string => {
    if (change === null) return ''
    switch (change.kind) {
      case 'everyone':
        return translate('tree.choose.everyoneBack')
      case 'hidden': {
        const name = namesOf([change.personId])
        if (change.carriedIds.length === 0) {
          return translate('tree.choose.hidden', { name })
        }
        return translate(
          change.carriedIds.length === 1
            ? 'tree.choose.hiddenWithOne'
            : 'tree.choose.hiddenWithMany',
          { name, names: namesOf(change.carriedIds) }
        )
      }
      case 'shown': {
        const name = namesOf([change.personId])
        const names = namesOf(change.withIds)
        if (change.linkIds.length > 0) {
          const links = namesOf(change.linkIds)
          return change.withIds.length === 0
            ? translate('tree.choose.backThrough', { links, name })
            : translate('tree.choose.backThroughWith', { links, name, names })
        }
        return change.withIds.length === 0
          ? translate('tree.choose.back', { name })
          : translate('tree.choose.backWith', { name, names })
      }
      default:
        return change satisfies never
    }
  }

  return { namesOf, sentenceOf }
}
