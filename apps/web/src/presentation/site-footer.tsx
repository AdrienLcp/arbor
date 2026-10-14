import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'

import { TextLink } from './components/text-link'
import { useTranslate } from './i18n/i18n-context'

import './site-footer.sass'

/** The foot of every screen, holding the link to the legal page the law requires. */
export const SiteFooter: React.FC = () => {
  const translate = useTranslate()

  return (
    <footer className='site-footer'>
      <TextLink href={paths.legal}>{translate('footer.legal')}</TextLink>
    </footer>
  )
}
