import type React from 'react'
import { useId } from 'react'

import { DemoNotice } from '@/features/demo/demo-notice'
import {
  type FamilyAccess,
  ONLOOKER,
  personIdOfMe
} from '@/features/family-access/family-access'
import {
  familyTreePathFor,
  Redirect,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { AlbumGlyph } from '@/presentation/components/album-glyph'
import { Button } from '@/presentation/components/button'
import { LookIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { WhoAmIChoices } from './who-am-i-choices'
import { useWhoAmI } from './who-am-i-provider'

import './who-am-i-page.sass'

/** "Who are you?" as a page, behind "Change": the visitor taps their own person, names themselves, or says they only look. Readers are never asked. */
export const WhoAmIPage: React.FC = () => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const { family, familyId } = useOpenFamily()
  const { me, remember } = useWhoAmI()
  const titleId = useId()

  if (family.role === 'reader') {
    return <Redirect to={familyTreePathFor(familyId)} />
  }

  const choose = (chosen: NonNullable<FamilyAccess['me']>): void => {
    remember(chosen)
    navigateTo(familyTreePathFor(familyId), { replace: true })
  }

  const lookOnly = (): void => choose(ONLOOKER)

  return (
    <Main aria-labelledby={titleId} className='who-am-i-page'>
      <DocumentTitle>{`${translate('whoAmI.title')} — ${family.settings.name}`}</DocumentTitle>
      <div className='who-am-i-head'>
        <p className='who-am-i-family'>
          <AlbumGlyph />
          {family.settings.name}
        </p>
        <h1 className='who-am-i-title' id={titleId}>
          {translate('whoAmI.title')}
        </h1>
        <p className='who-am-i-intro'>{translate('whoAmI.intro')}</p>
        <DemoNotice familyId={familyId} />
      </div>
      <WhoAmIChoices myPersonId={personIdOfMe(me)} onChoose={choose}>
        <Button onPress={lookOnly} variant='link'>
          <LookIcon aria-hidden='true' />
          {translate('whoAmI.onlooker')}
        </Button>
      </WhoAmIChoices>
    </Main>
  )
}
