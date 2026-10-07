import type React from 'react'

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
