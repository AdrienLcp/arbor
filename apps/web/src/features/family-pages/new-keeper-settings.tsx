import type React from 'react'
import { useState } from 'react'

import { familyLinkFor } from '@arbor/protocol/family-link'

import { issueKey } from '@/infrastructure/api/family-api'
import { pageOrigin } from '@/infrastructure/browser'
import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { AddKeeperIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { SharedLink } from './shared-link'
import { useApiAction } from './use-api-action'

import './settings-section.sass'

/** A keeper link for someone else: shown once, never kept on this device, which already has its own. */
export const NewKeeperSettings: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId, key } = useOpenFamily()
  const { hasFailed, isPending, run } = useApiAction()
  const [newKeeperLink, setNewKeeperLink] = useState<string | null>(null)

  const create = (): void =>
    run(
      () => issueKey({ familyId, key, role: 'keeper' }),
      ({ data: issued }) =>
        setNewKeeperLink(
          familyLinkFor({ familyId, key: issued.key, origin: pageOrigin() })
        )
    )

  return (
    <div className='settings-item'>
      <h3 className='settings-item-title'>
        {translate('familySettings.newKeeper.title')}
      </h3>
      <p className='settings-item-body'>
        {translate('familySettings.newKeeper.body')}
      </p>
      {hasFailed ? (
        <FailureNotice>{translate('common.failed')}</FailureNotice>
      ) : null}
      {newKeeperLink === null ? (
        <Button isPending={isPending} onPress={create} variant='ghost'>
          <AddKeeperIcon aria-hidden='true' />
          {translate('familySettings.newKeeper.create')}
        </Button>
      ) : (
        <SharedLink
          description={translate('familySettings.newKeeper.ready')}
          familyName={family.settings.name}
          isPrivate
          title={translate('familySettings.newKeeper.linkTitle')}
          url={newKeeperLink}
        />
      )}
    </div>
  )
}
