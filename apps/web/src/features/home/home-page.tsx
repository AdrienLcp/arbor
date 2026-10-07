import type React from 'react'
import { useId } from 'react'

import { paths } from '@/infrastructure/router/navigation'
import { AlbumGlyph } from '@/presentation/components/album-glyph'
import { ButtonLink } from '@/presentation/components/button-link'
import { AddIcon, PasteIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { CoverSpread } from './cover-spread'
import { RememberedTrees } from './remembered-trees'

import './home-page.sass'

const STEPS = ['create', 'send', 'complete'] as const

/** The album's cover: what Arbor is, the way in for a new family, and the trees this device already opened. */
export const HomePage: React.FC = () => {
  const translate = useTranslate()
  const titleId = useId()

  return (
    <Main className='home-page'>
      <DocumentTitle>{`${translate('app.name')} — ${translate('home.title')}`}</DocumentTitle>
      <RememberedTrees />
      <section aria-labelledby={titleId} className='album-cover'>
        <p className='cover-brand'>
          <AlbumGlyph isOnCover />
          {translate('app.name')}
        </p>
        <div className='cover-words'>
          <h1 className='cover-title' id={titleId}>
            {translate('home.title')}
            <span className='cover-blank'>{translate('home.titleBlank')}</span>
          </h1>
          <p className='cover-lead'>{translate('home.lead')}</p>
          <div className='cover-actions'>
            <ButtonLink href={paths.createFamily} variant='cover'>
              <AddIcon aria-hidden='true' />
              {translate('home.create')}
            </ButtonLink>
            <ButtonLink href={paths.openLink} variant='link'>
              <PasteIcon aria-hidden='true' />
              {translate('home.openLink')}
            </ButtonLink>
          </div>
          <p className='cover-fine'>{translate('home.fine')}</p>
          <ol
            aria-label={translate('home.steps.label')}
            className='cover-steps'
          >
            {STEPS.map((step, index) => (
              <li className='cover-step' key={step}>
                <span aria-hidden='true' className='cover-step-number'>
                  {index + 1}
                </span>
                <span className='cover-step-title'>
                  {translate(`home.steps.${step}.title`)}
                </span>
                {translate(`home.steps.${step}.body`)}
              </li>
            ))}
          </ol>
        </div>
        <CoverSpread />
      </section>
    </Main>
  )
}
