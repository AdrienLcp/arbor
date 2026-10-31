import type { Author } from '@arbor/protocol/change-log'

import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** How a change's signature reads: the person's name in the tree, the name typed by someone not in it, or someone of the family. */
export const useAuthorName = (): ((author: Author) => string) => {
  const translate = useTranslate()
  const faces = usePersonFaces()
  return (author) => {
    switch (author.kind) {
      case 'person':
        return (
          faces.get(author.personId)?.name ?? translate('common.unnamedPerson')
        )
      case 'named':
        return author.name
      case 'anonymous':
        return translate('common.anonymousAuthor')
      default:
        return author satisfies never
    }
  }
}
