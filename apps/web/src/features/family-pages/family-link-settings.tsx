import type React from 'react'
import { useState } from 'react'

import { rememberKey } from '@/features/family-access/remembered-families'
import { replaceFamilyKey } from '@/infrastructure/api/family-api'
import { familySharePathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { ConfirmDialog } from '@/presentation/components/confirm-dialog'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { ReplaceIcon, ShareIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { useApiAction } from './use-api-action'

import './settings-section.sass'

/** Replacing the family link: whoever holds the old one is locked out at once. Asked twice, since it affects everyone. */
export const FamilyLinkSettings: React.FC = () => {
  const translate = useTranslate()
  const { familyId, key } = useOpenFamily()
  const { hasFailed, isPending, run } = useApiAction()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isReplaced, setIsReplaced] = useState(false)

  const replace = (): void =>
    run(
      () => replaceFamilyKey({ familyId, key }),
      ({ data: issued }) => {
        rememberKey(familyId, { key: issued.key, role: 'contributor' })
        setIsConfirming(false)
        setIsReplaced(true)
      }
    )

  return (
    <div className='settings-item'>
      <h3 className='settings-item-title'>
        {translate('familySettings.familyLink.title')}
      </h3>
      <p className='settings-item-body'>
        {translate(
          isReplaced
            ? 'familySettings.familyLink.done'
            : 'familySettings.familyLink.body'
        )}
      </p>
      {hasFailed && !isConfirming ? (
        <FailureNotice>{translate('common.failed')}</FailureNotice>
      ) : null}
      {isReplaced ? (
        <ButtonLink href={familySharePathFor(familyId)}>
          <ShareIcon aria-hidden='true' />
          {translate('familySettings.familyLink.sendNew')}
        </ButtonLink>
      ) : (
        <Button onPress={() => setIsConfirming(true)} variant='ghost'>
          <ReplaceIcon aria-hidden='true' />
          {translate('familySettings.familyLink.replace')}
        </Button>
      )}
      <ConfirmDialog
        cancelLabel={translate('familySettings.familyLink.confirm.no')}
        confirmLabel={translate('familySettings.familyLink.confirm.yes')}
        isOpen={isConfirming}
        isPending={isPending}
        onCancel={() => setIsConfirming(false)}
        onConfirm={replace}
        title={translate('familySettings.familyLink.confirm.title')}
      >
        <p>{translate('familySettings.familyLink.confirm.body')}</p>
        {hasFailed ? (
          <FailureNotice>{translate('common.failed')}</FailureNotice>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}
