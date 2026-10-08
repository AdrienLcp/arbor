import type React from 'react'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import { PersonIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './who-first-notice.sass'

/** Asks an unsigned visitor to say who they are before changing anything: every change is signed. */
export const WhoFirstNotice: React.FC = () => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()

  return (
    <div className='who-first-notice'>
      <p className='who-first-notice-text'>{translate('edit.whoFirst')}</p>
      <ButtonLink href={whoAmIPathFor(familyId)} variant='ghost'>
        <PersonIcon aria-hidden='true' />
        {translate('edit.whoFirstAction')}
      </ButtonLink>
    </div>
  )
}
