import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'
import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

export const NotFoundPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main>
      <DocumentTitle>{`${translate('notFound.title')} — ${translate('app.name')}`}</DocumentTitle>
      <h1>{translate('notFound.title')}</h1>
      <TextLink href={paths.home}>{translate('notFound.home')}</TextLink>
    </Main>
  )
}
