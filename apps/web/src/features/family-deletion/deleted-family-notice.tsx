import type React from 'react'

import { useNavigationState } from '@/infrastructure/router/navigation'
import { CheckIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { deletedFamilyNameOf } from './deleted-family-state'

import './deleted-family-notice.sass'

/** Tells the keeper, back on the home page, that the family they deleted is gone. */
export const DeletedFamilyNotice: React.FC = () => {
  const translate = useTranslate()
  const name = deletedFamilyNameOf(useNavigationState())

  if (name === null) {
    return null
  }

  return (
    <p className='deleted-family-notice' role='status'>
      <CheckIcon aria-hidden='true' className='deleted-family-notice-icon' />
      {translate('familyDeletion.done', { name })}
    </p>
  )
}
