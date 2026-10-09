import type { Author } from '@arbor/protocol/change-log'

import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import { useTranslate } from '@/presentation/i18n/i18n-context'

/** How a change's signature reads: the person's name in the tree, or the name typed by someone not in it. */
export const useAuthorName = (): ((author: Author) => string) => {
  const translate = useTranslate()
  const faces = usePersonFaces()
  return (author) =>
    author.kind === 'named'
      ? author.name
      : (faces.get(author.personId)?.name ?? translate('common.unnamedPerson'))
}
