import type React from 'react'

import type { AccessKey } from '@arbor/protocol/access'
import { familyLinkFor } from '@arbor/protocol/family-link'

import { rememberedFamily } from '@/features/family-access/remembered-families'
import { pageOrigin } from '@/infrastructure/browser'
import {
  familyPathFor,
  familySettingsPathFor
} from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import { NextIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { SharedLink } from './shared-link'

import './family-share-page.sass'

/**
 * Every link this device holds, each with its use: the family link to send,
 * the read-only one, and the keeper's own. A key is only ever known on the
 * device that received it — the server keeps none.
 */
export const FamilySharePage: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId } = useOpenFamily()
  const { keys } = rememberedFamily(familyId)
  const familyName = family.settings.name
  const linkFor = (key: AccessKey): string =>
    familyLinkFor({ familyId, key, origin: pageOrigin() })
  const isKeeper = family.role === 'keeper'

  return (
    <>
      <FamilyAppBar />
      <Main className='family-share-page'>
        <DocumentTitle>{`${translate('familyShare.title')} — ${familyName}`}</DocumentTitle>
        <div className='family-share-head'>
          <h1 className='family-share-title'>
            {translate('familyShare.title')}
          </h1>
          <p className='family-share-intro'>{translate('familyShare.intro')}</p>
        </div>
        {keys.contributor === undefined ? null : (
          <SharedLink
            description={translate('familyShare.familyLink.description')}
            familyName={familyName}
            hasQrCode
            isMain
            title={translate('familyShare.familyLink.title')}
            url={linkFor(keys.contributor)}
          />
        )}
        {keys.contributor === undefined && isKeeper ? (
          <p className='family-share-unknown'>
            {translate('familyShare.familyLink.unknown')}{' '}
            <TextLink href={familySettingsPathFor(familyId)}>
              {translate('familyShare.familyLink.unknownAction')}
            </TextLink>
          </p>
        ) : null}
        {keys.reader === undefined ? null : (
          <SharedLink
            description={translate('familyShare.readerLink.description')}
            familyName={familyName}
            hasQrCode
            isMain={keys.contributor === undefined}
            title={translate('familyShare.readerLink.title')}
            url={linkFor(keys.reader)}
          />
        )}
        {keys.keeper === undefined ? null : (
          <SharedLink
            description={translate('familyShare.keeperLink.description')}
            familyName={familyName}
            isPrivate
            title={translate('familyShare.keeperLink.title')}
            url={linkFor(keys.keeper)}
          />
        )}
        <ButtonLink href={familyPathFor(familyId)} variant='link'>
          {translate('common.openTree')}
          <NextIcon aria-hidden='true' />
        </ButtonLink>
      </Main>
    </>
  )
}
