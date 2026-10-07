import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import { BrokenLinkIcon, PasteIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './family-notice.sass'

/** The link was replaced or revoked, or this device never received one: only the family can hand out the new one. */
export const LinkRefusedScreen: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='family-notice'>
      <DocumentTitle>{`${translate('family.refused.title')} — ${translate('app.name')}`}</DocumentTitle>
      <BrokenLinkIcon aria-hidden='true' className='notice-icon' />
      <h1 className='notice-title'>{translate('family.refused.title')}</h1>
      <p className='notice-body'>{translate('family.refused.why')}</p>
      <p className='notice-body'>{translate('family.refused.what')}</p>
      <div className='notice-actions'>
        <ButtonLink href={paths.openLink} isBlock>
          <PasteIcon aria-hidden='true' />
          {translate('family.refused.newLink')}
        </ButtonLink>
        <TextLink href={paths.home}>{translate('common.home')}</TextLink>
      </div>
    </Main>
  )
}
