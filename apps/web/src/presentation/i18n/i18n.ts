import { createI18n } from '@adrienlcp/i18n'

import { EN_DICTIONARY } from './dictionary-en'
import { FR_DICTIONARY } from './dictionary-fr'

/** French is the reference: the first families are French. */
export const i18n = createI18n({
  defaultLocale: 'fr',
  dictionaries: { en: EN_DICTIONARY, fr: FR_DICTIONARY }
})
