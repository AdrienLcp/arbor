import { Result } from '@adrienlcp/result'
import type React from 'react'
import { useState } from 'react'

import type { KeyView } from '@arbor/protocol/access'

import {
  forgetKey,
  rememberedFamily,
  rememberKey
} from '@/features/family-access/remembered-families'
import {
  issueKey,
  revokeKey,
  updateSettings
} from '@/infrastructure/api/family-api'
import {
  familySharePathFor,
  useRefreshRouteData
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { AddIcon, RevokeIcon, ShareIcon } from '@/presentation/components/icons'
import { Switch } from '@/presentation/components/switch'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { useApiAction } from './use-api-action'

import './settings-section.sass'

type ReaderLinkSettingsProps = {
  /** Every key of the family, as the keeper's overview listed them. */
  keys: readonly KeyView[]
  /** The overview changed: load it again. */
  onChanged: () => void
}

/** The read-only link: create it, turn it off, and decide what it hides of the living. */
export const ReaderLinkSettings: React.FC<ReaderLinkSettingsProps> = ({
  keys,
  onChanged
}) => {
  const translate = useTranslate()
  const { family, familyId, key } = useOpenFamily()
  const refreshFamily = useRefreshRouteData()
  const linkAction = useApiAction()
  const hidingAction = useApiAction()
  const [isHidingChosen, setIsHidingChosen] = useState<boolean | null>(null)

  const activeReaderKeys = keys.filter(
    ({ revokedAt, role }) => role === 'reader' && revokedAt === null
  )
  const isReaderKeyHere = rememberedFamily(familyId).keys.reader !== undefined

  const create = (): void =>
    linkAction.run(
      () => issueKey({ familyId, key, role: 'reader' }),
      ({ data: issued }) => {
        rememberKey(familyId, { key: issued.key, role: 'reader' })
        onChanged()
      }
    )

  const revoke = (): void =>
    linkAction.run(
      async () => {
        const revoked = await Promise.all(
          activeReaderKeys.map(({ id }) =>
            revokeKey({ familyId, key, keyId: id })
          )
        )

        return (
          revoked.find(({ status }) => status === 'failure') ?? Result.success()
        )
      },
      () => {
        forgetKey(familyId, 'reader')
        onChanged()
      }
    )

  const changeHiding = (hides: boolean): void => {
    setIsHidingChosen(hides)
    hidingAction.run(
      () =>
        updateSettings({
          familyId,
          key,
          settings: { hidesLivingFromReaders: hides }
        }),
      refreshFamily
    )
  }

  const hasHidingFailed = hidingAction.hasFailed && isHidingChosen !== null

  return (
    <div className='settings-item'>
      <h3 className='settings-item-title'>
        {translate('familySettings.readerLink.title')}
      </h3>
      <p className='settings-item-body'>
        {translate('familySettings.readerLink.body')}
      </p>
      <p className='settings-item-body'>
        {translate(
          activeReaderKeys.length === 0
            ? 'familySettings.readerLink.none'
            : 'familySettings.readerLink.active'
        )}{' '}
        {activeReaderKeys.length > 0 && !isReaderKeyHere
          ? translate('familySettings.readerLink.otherDevice')
          : null}
      </p>
      {linkAction.hasFailed ? (
        <FailureNotice>{translate('common.failed')}</FailureNotice>
      ) : null}
      <div className='settings-item-actions'>
        {activeReaderKeys.length === 0 ? (
          <Button
            isPending={linkAction.isPending}
            onPress={create}
            variant='ghost'
          >
            <AddIcon aria-hidden='true' />
            {translate('familySettings.readerLink.create')}
          </Button>
        ) : (
          <>
            {isReaderKeyHere ? (
              <ButtonLink href={familySharePathFor(familyId)} variant='ghost'>
                <ShareIcon aria-hidden='true' />
                {translate('familySettings.readerLink.see')}
              </ButtonLink>
            ) : null}
            <Button
              isPending={linkAction.isPending}
              onPress={revoke}
              variant='link'
            >
              <RevokeIcon aria-hidden='true' />
              {translate('familySettings.readerLink.revoke')}
            </Button>
          </>
        )}
      </div>
      <Switch
        isDisabled={hidingAction.isPending}
        isSelected={
          hasHidingFailed
            ? family.settings.hidesLivingFromReaders
            : (isHidingChosen ?? family.settings.hidesLivingFromReaders)
        }
        onChange={changeHiding}
      >
        {translate('familySettings.readerLink.hideLiving')}
      </Switch>
      {hasHidingFailed ? (
        <FailureNotice>{translate('common.failed')}</FailureNotice>
      ) : null}
    </div>
  )
}
