import {
  type FamilyAccess,
  ONLOOKER
} from '@/features/family-access/family-access'
import { personName } from '@/features/people/person-name'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type OpenFamily, useOpenFamily } from './family-loader'
import { useWhoAmI } from './who-am-i-provider'

/** What the visitor's line says of them: a reader is never asked, a visitor who never said is invited to, anyone else reads who they said they are. */
export type MeLine =
  | { kind: 'reader' }
  | { kind: 'unsaid' }
  | { kind: 'said'; sentence: string }

/** The name the visitor gave on "Who are you?", `null` when they gave none or their person left the tree. */
const nameOf = (
  me: FamilyAccess['me'],
  { family }: OpenFamily
): string | null => {
  if (me === null || me === ONLOOKER) {
    return null
  }

  if (me.kind === 'named') {
    return me.name
  }

  const person = family.family.persons.find(({ id }) => id === me.personId)

  return person === undefined ? null : personName(person)
}

/** Who this device's visitor said they are, as the tree's line and the phone's "More" menu both say it. */
export const useMeLine = (): MeLine => {
  const translate = useTranslate()
  const openFamily = useOpenFamily()
  const { me } = useWhoAmI()

  if (openFamily.family.role === 'reader') {
    return { kind: 'reader' }
  }

  const name = nameOf(me, openFamily)

  if (name === null && me !== ONLOOKER) {
    return { kind: 'unsaid' }
  }

  return {
    kind: 'said',
    sentence:
      name === null ? translate('me.onlooker') : translate('me.is', { name })
  }
}
