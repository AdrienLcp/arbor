import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'

import { TextLink } from './components/text-link'
import { useI18n } from './i18n/i18n-context'
import { RichText } from './i18n/rich-text'
import { AUTHOR, SOURCE_REPOSITORY_HREF } from './site-credits'

import './site-footer.sass'

/**
 * The foot of every screen: who made the site, linked to his own, its source,
 * and the legal page the law requires.
 */
export const SiteFooter: React.FC = () => {
  const { locale, translate } = useI18n()

  const authorLink = (children: string): React.ReactNode => (
    <TextLink href={AUTHOR.siteHref[locale]}>{children}</TextLink>
  )

  return (
    <footer className='site-footer'>
      <p>
        <RichText
          parts={translate.rich('footer.credit', {
            author: authorLink,
            name: AUTHOR.name
          })}
        />
      </p>
      {SOURCE_REPOSITORY_HREF !== null && (
        <TextLink href={SOURCE_REPOSITORY_HREF}>
          {translate('footer.source')}
        </TextLink>
      )}
      <TextLink href={paths.legal}>{translate('footer.legal')}</TextLink>
    </footer>
  )
}
