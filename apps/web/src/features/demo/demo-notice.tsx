import type React from 'react'

import type { FamilyId } from '@arbor/protocol/access'
import { DEMO_FAMILY_ID } from '@arbor/protocol/demo-family'

import { BookIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './demo-notice.sass'

export type DemoNoticeProps = {
  familyId: FamilyId
}

/** Tells a visitor of the public demo that the family is made up and theirs to change; shown nowhere else. */
export const DemoNotice: React.FC<DemoNoticeProps> = ({ familyId }) => {
  const translate = useTranslate()
  if (familyId !== DEMO_FAMILY_ID) return null

  return (
    <p className='demo-notice'>
      <BookIcon aria-hidden='true' className='demo-notice-icon' />
      <span>
        <strong className='demo-notice-title'>
          {translate('demo.notice.title')}
        </strong>{' '}
        {translate('demo.notice.body')}
      </span>
    </p>
  )
}
