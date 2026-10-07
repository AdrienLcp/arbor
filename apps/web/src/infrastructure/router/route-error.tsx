import type React from 'react'

import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { paths } from './navigation'

/**
 * Replaces the whole app when a route throws. A plain link reloads the page,
 * which also clears a half-broken state.
 */
export const ErrorScreen: React.FC = () => {
  const translate = useTranslate()

  return (
    <main>
      <h1>{translate('error.screen.title')}</h1>
      <a href={paths.home}>{translate('error.screen.home')}</a>
    </main>
  )
}

/** The page for an address no route owns. */
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
