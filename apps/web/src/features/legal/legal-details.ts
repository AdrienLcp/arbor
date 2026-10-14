import type { Locale } from '@arbor/protocol/locale'

/** Who publishes Arbor: a private individual, reached through his site's contact page. */
export const PUBLISHER = {
  contactHrefFor: {
    en: 'https://adrienlcp.com/en/contact',
    fr: 'https://adrienlcp.com/fr/contact'
  } satisfies Record<Locale, string>,
  name: 'Adrien Lacourpaille'
} as const

/** The site and every family's storage run on Cloudflare Workers and Durable Objects. */
export const HOST = {
  addressLines: ['101 Townsend St', 'San Francisco, CA 94107', 'USA'],
  name: 'Cloudflare, Inc.'
} as const

/** How long Workers Logs keeps a request's log line on the free plan. */
export const LOG_RETENTION_DAYS = 3

export const CNIL_COMPLAINT_HREF = 'https://www.cnil.fr/fr/plaintes'
