import type React from 'react'
import { useState } from 'react'

import { forgetFamily } from '@/features/family-access/remembered-families'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { useApiAction } from '@/features/family-pages/use-api-action'
import { deleteFamily } from '@/infrastructure/api/family-api'
import { paths, useNavigateTo } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { FormDialog } from '@/presentation/components/form-dialog'
import { BinIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { DeleteFamilyForm } from './delete-family-form'
import type { DeletedFamilyState } from './deleted-family-state'

/** The keeper's way to erase the family for everyone, last on the settings page. */
export const DeleteFamilySettings: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId, key } = useOpenFamily()
  const { hasFailed, isPending, run } = useApiAction()
  const navigateTo = useNavigateTo()
  const [isConfirming, setIsConfirming] = useState(false)
  const familyName = family.settings.name

  const erase = (confirmedName: string): void =>
    run(
      () => deleteFamily({ confirmedName, familyId, key }),
      () => {
        forgetFamily(familyId)
        navigateTo(paths.home, {
          replace: true,
          state: { deletedFamilyName: familyName } satisfies DeletedFamilyState
        })
      }
    )

  return (
    <div className='settings-item'>
      <h3 className='settings-item-title'>
        {translate('familyDeletion.title')}
      </h3>
      <p className='settings-item-body'>{translate('familyDeletion.body')}</p>
      <Button onPress={() => setIsConfirming(true)} variant='ghost'>
        <BinIcon aria-hidden='true' />
        {translate('familyDeletion.open')}
      </Button>
      <FormDialog
        closeLabel={translate('familyDeletion.dialog.cancel')}
        isOpen={isConfirming}
        isPending={isPending}
        onClose={() => setIsConfirming(false)}
        title={translate('familyDeletion.dialog.title')}
      >
        <DeleteFamilyForm
          familyName={familyName}
          hasFailed={hasFailed}
          isPending={isPending}
          onCancel={() => setIsConfirming(false)}
          onDelete={erase}
        />
      </FormDialog>
    </div>
  )
}
