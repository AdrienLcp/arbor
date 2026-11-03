import type { Locale } from '@arbor/protocol/locale'

/** The author every screen credits in its footer, linked to his site in the reader's language. */
export const AUTHOR = {
  name: 'Adrien Lacourpaille',
  siteHref: {
    en: 'https://adrienlcp.com/en',
    fr: 'https://adrienlcp.com/fr'
  }
} as const satisfies { name: string; siteHref: Record<Locale, string> }

/**
 * Arbor's public repository, linked from the footer. `null` when the source
 * is private: the footer then links none.
 */
export const SOURCE_REPOSITORY_HREF: string | null =
  'https://github.com/AdrienLcp/arbor'
