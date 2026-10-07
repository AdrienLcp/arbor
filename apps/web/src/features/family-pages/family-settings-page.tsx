import type React from 'react'
import { useId } from 'react'

import { paths } from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import { HomeIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { KeeperSettings } from './keeper-settings'
import { MeSummary } from './me-summary'

import './family-settings-page.sass'
import './settings-section.sass'

/** What this phone remembers of the family, then — for a keeper — what the whole family shares. */
export const FamilySettingsPage: React.FC = () => {
  const translate = useTranslate()
  const deviceTitleId = useId()
  const { family } = useOpenFamily()

  return (
    <>
      <FamilyAppBar />
      <Main className='family-settings-page'>
        <DocumentTitle>{`${translate('familySettings.title')} — ${family.settings.name}`}</DocumentTitle>
        <h1 className='family-settings-title'>
          {translate('familySettings.title')}
        </h1>
        <section aria-labelledby={deviceTitleId} className='settings-group'>
          <h2 className='settings-group-title' id={deviceTitleId}>
            {translate('familySettings.device.title')}
          </h2>
          <div className='settings-item'>
            <MeSummary />
          </div>
          <div className='settings-item'>
            <ThemeSwitch />
          </div>
          <div className='settings-item'>
            <ButtonLink href={paths.home} variant='link'>
              <HomeIcon aria-hidden='true' />
              {translate('familySettings.device.trees')}
            </ButtonLink>
          </div>
        </section>
        {family.role === 'keeper' ? <KeeperSettings /> : null}
      </Main>
    </>
  )
}
