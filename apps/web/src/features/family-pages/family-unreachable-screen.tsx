import type React from 'react'

import { useRefreshRouteData } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { OfflineIcon, RetryIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './family-notice.sass'

/** The family did not answer: no connection, or the server is down. Nothing is wrong with the link. */
export const FamilyUnreachableScreen: React.FC = () => {
  const translate = useTranslate()
  const retry = useRefreshRouteData()

  return (
    <Main className='family-notice'>
      <DocumentTitle>{`${translate('family.unreachable.title')} — ${translate('app.name')}`}</DocumentTitle>
      <OfflineIcon aria-hidden='true' className='notice-icon' />
      <h1 className='notice-title'>{translate('family.unreachable.title')}</h1>
      <p className='notice-body'>{translate('family.unreachable.what')}</p>
      <div className='notice-actions'>
        <Button isBlock onPress={retry}>
          <RetryIcon aria-hidden='true' />
          {translate('family.unreachable.retry')}
        </Button>
      </div>
    </Main>
  )
}
