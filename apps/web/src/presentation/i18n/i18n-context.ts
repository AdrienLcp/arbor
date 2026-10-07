import { createSafeContext } from '@adrienlcp/react'

import type { Locale } from '@arbor/protocol/locale'

import type { Translate } from './translation'

type I18nContextValue = {
  /** The language the interface speaks, for the text it writes outside the dictionary — a date in words. */
  locale: Locale
  translate: Translate
}

export const [I18nContext, useI18n] =
  createSafeContext<I18nContextValue>('I18nProvider')

export const useTranslate = (): Translate => useI18n().translate

export const useLocale = (): Locale => useI18n().locale
