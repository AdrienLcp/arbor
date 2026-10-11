import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'

import { ButtonLink } from './components/button-link'
import { TreeMark } from './components/tree-mark'
import { useTranslate } from './i18n/i18n-context'

import './site-header.sass'

/** The bar over a page outside any family: the way back to the cover. */
export const SiteHeader: React.FC = () => {
  const translate = useTranslate()

  return (
    <header className='site-header'>
      <ButtonLink
        aria-label={translate('common.home')}
        className='site-brand'
        href={paths.home}
        variant='quiet'
      >
        <TreeMark />
        {translate('app.name')}
      </ButtonLink>
    </header>
  )
}
