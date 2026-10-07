import type React from 'react'
import { useEffect } from 'react'

import {
  preferredLanguages,
  setDocumentLanguage
} from '@/infrastructure/browser'

import { i18n } from './i18n'
import { I18nContext } from './i18n-context'

type I18nProviderProps = {
  children: React.ReactNode
}

/** The interface speaks the first of the reader's languages the app knows, French otherwise. */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const languages = preferredLanguages()
  const locale = i18n.negotiate(languages)

  useEffect(() => {
    setDocumentLanguage(locale)
  }, [locale])

  return (
    <I18nContext value={{ translate: i18n.translator(locale, languages) }}>
      {children}
    </I18nContext>
  )
}
