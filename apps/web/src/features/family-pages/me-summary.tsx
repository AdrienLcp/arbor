import type React from 'react'

import {
  type FamilyAccess,
  ONLOOKER
} from '@/features/family-access/family-access'
import { personName } from '@/features/people/person-name'
import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { PersonIcon } from '@/presentation/components/icons'
import { TextLink } from '@/presentation/components/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type OpenFamily, useOpenFamily } from './family-loader'
import { useWhoAmI } from './who-am-i-provider'

import './me-summary.sass'

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

/** Who this device's visitor said they are, and the way to change it; a visitor who never said, or whose person left the tree, is invited to. */
export const MeSummary: React.FC = () => {
  const translate = useTranslate()
  const openFamily = useOpenFamily()
  const { ask, me } = useWhoAmI()
  const { family, familyId } = openFamily

  if (family.role === 'reader') {
    return <p className='me-summary'>{translate('me.reader')}</p>
  }

  const name = nameOf(me, openFamily)

  if (name === null && me !== ONLOOKER) {
    return (
      <p className='me-summary'>
        <PersonIcon aria-hidden='true' className='me-summary-icon' />
        <span>
          {translate('me.nobody')}{' '}
          <Button className='me-summary-ask' onPress={ask} variant='link'>
            {translate('me.tell')}
          </Button>
        </span>
      </p>
    )
  }

  const sentence =
    name === null ? translate('me.onlooker') : translate('me.is', { name })

  return (
    <p className='me-summary'>
      <PersonIcon aria-hidden='true' className='me-summary-icon' />
      <span>
        {sentence}{' '}
        <TextLink href={whoAmIPathFor(familyId)}>
          {translate('me.change')}
        </TextLink>
      </span>
    </p>
  )
}
