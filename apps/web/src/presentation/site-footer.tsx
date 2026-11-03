import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'

import { TextLink } from './components/text-link'
import { useI18n } from './i18n/i18n-context'
import { RichText } from './i18n/rich-text'
import { AUTHOR, SOURCE_REPOSITORY_HREF } from './site-credits'

import './site-footer.sass'

/**
 * Under the tree the line scrolls sideways where it is wider than the screen,
 * and Chrome leaves a link it cuts in two where it is when the keyboard
 * reaches it. A pointer never scrolls it: the line would move under the press.
 */
const revealKeyboardFocus = (event: React.FocusEvent): void => {
  if (event.target.matches(':focus-visible')) {
    event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }
}

/**
 * The foot of every screen: who made the site, linked to his own, its source,
 * and the legal page the law requires.
 */
export const SiteFooter: React.FC = () => {
  const { locale, translate } = useI18n()

  const authorLink = (children: string): React.ReactNode => (
    <TextLink href={AUTHOR.siteHref[locale]} onFocus={revealKeyboardFocus}>
      {children}
    </TextLink>
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
        <TextLink href={SOURCE_REPOSITORY_HREF} onFocus={revealKeyboardFocus}>
          {translate('footer.source')}
        </TextLink>
      )}
      <TextLink href={paths.legal} onFocus={revealKeyboardFocus}>
        {translate('footer.legal')}
      </TextLink>
    </footer>
  )
}
