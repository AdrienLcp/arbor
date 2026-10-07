import type React from 'react'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { personName } from '@/features/people/person-name'
import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { PersonIcon } from '@/presentation/components/icons'
import { TextLink } from '@/presentation/components/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type OpenFamily, useOpenFamily } from './family-loader'

import './me-summary.sass'

/** The name the visitor gave on "Who are you?", `null` when they gave none or their person left the tree. */
const nameOfMe = ({ family, familyId }: OpenFamily): string | null => {
  const me = rememberedMe(familyId)

  if (me === null || me === ONLOOKER) {
    return null
  }

  if (me.kind === 'named') {
    return me.name
  }

  const person = family.family.persons.find(({ id }) => id === me.personId)

  return person === undefined ? null : personName(person)
}

/** Who this device's visitor said they are, and the way to change it. */
export const MeSummary: React.FC = () => {
  const translate = useTranslate()
  const openFamily = useOpenFamily()
  const { family, familyId } = openFamily

  if (family.role === 'reader') {
    return <p className='me-summary'>{translate('me.reader')}</p>
  }

  const name = nameOfMe(openFamily)
  const isOnlooker = rememberedMe(familyId) === ONLOOKER
  const sentence =
    name !== null
      ? translate('me.is', { name })
      : translate(isOnlooker ? 'me.onlooker' : 'me.nobody')

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
