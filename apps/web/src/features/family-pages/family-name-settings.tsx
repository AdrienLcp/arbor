import type React from 'react'
import { useState } from 'react'

import { updateSettings } from '@/infrastructure/api/family-api'
import { useRefreshRouteData } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { Form } from '@/presentation/components/form'
import { CheckIcon } from '@/presentation/components/icons'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { useApiAction } from './use-api-action'

import './settings-section.sass'

/** The family's name, as the app bar, the home page and the printed sheet show it: the keeper rewrites it. */
export const FamilyNameSettings: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId, key } = useOpenFamily()
  const refreshFamily = useRefreshRouteData()
  const { hasFailed, isPending, run } = useApiAction()
  const [name, setName] = useState(family.settings.name)
  const [isSaved, setIsSaved] = useState(false)

  const isUnchanged = name.trim() === family.settings.name

  const save = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    run(
      () => updateSettings({ familyId, key, settings: { name: name.trim() } }),
      () => {
        setIsSaved(true)
        void refreshFamily()
      }
    )
  }

  return (
    <div className='settings-item'>
      <Form className='settings-item-form' onSubmit={save}>
        <TextField
          description={translate('familySettings.name.hint')}
          errorMessage={translate('familySettings.name.missing')}
          isRequired
          label={translate('familySettings.name.field')}
          name='familyName'
          onChange={(changed) => {
            setName(changed)
            setIsSaved(false)
          }}
          value={name}
        />
        {hasFailed ? (
          <FailureNotice>{translate('common.failed')}</FailureNotice>
        ) : null}
        <div className='settings-item-actions'>
          <Button
            isDisabled={isUnchanged}
            isPending={isPending}
            type='submit'
            variant='ghost'
          >
            <CheckIcon aria-hidden='true' />
            {translate('familySettings.name.save')}
          </Button>
        </div>
        <p className='settings-item-body' role='status'>
          {isSaved && isUnchanged
            ? translate('familySettings.name.saved')
            : null}
        </p>
      </Form>
    </div>
  )
}
