import type React from 'react'

import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

export const WhoAmIPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main>
      <DocumentTitle>{`${translate('whoAmI.title')} — ${translate('app.name')}`}</DocumentTitle>
      <h1>{translate('whoAmI.title')}</h1>
    </Main>
  )
}
