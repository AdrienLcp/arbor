import type React from 'react'

import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'

export const FamilyHomePage: React.FC = () => {
  const translate = useTranslate()
  const { family } = useOpenFamily()

  return (
    <Main>
      <DocumentTitle>{`${family.settings.name} — ${translate('app.name')}`}</DocumentTitle>
      <h1>{family.settings.name}</h1>
    </Main>
  )
}
