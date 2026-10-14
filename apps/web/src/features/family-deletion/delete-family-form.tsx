import type React from 'react'
import { useState } from 'react'

import { isFamilyNameConfirmed } from '@arbor/core/family/family-name-confirmation'

import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { Form } from '@/presentation/components/form'
import { BinIcon } from '@/presentation/components/icons'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './delete-family-form.sass'

type DeleteFamilyFormProps = {
  familyName: string
  hasFailed: boolean
  isPending: boolean
  onCancel: () => void
  onDelete: (confirmedName: string) => void
}

/** What goes, said plainly, then the family's name typed by hand: the one gesture in Arbor that cannot be undone. */
export const DeleteFamilyForm: React.FC<DeleteFamilyFormProps> = ({
  familyName,
  hasFailed,
  isPending,
  onCancel,
  onDelete
}) => {
  const translate = useTranslate()
  const [typedName, setTypedName] = useState('')
  const isConfirmed = isFamilyNameConfirmed({
    name: familyName,
    typed: typedName
  })

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isConfirmed) onDelete(typedName)
  }

  return (
    <Form className='delete-family-form' onSubmit={submit}>
      <div className='delete-family-words'>
        <p>{translate('familyDeletion.dialog.body')}</p>
        <p className='delete-family-final'>
          {translate('familyDeletion.dialog.final')}
        </p>
      </div>
      <TextField
        autoComplete='off'
        description={translate('familyDeletion.dialog.fieldHint', {
          name: familyName
        })}
        isDisabled={isPending}
        label={translate('familyDeletion.dialog.field')}
        onChange={setTypedName}
        value={typedName}
      />
      {hasFailed ? (
        <FailureNotice>{translate('common.failed')}</FailureNotice>
      ) : null}
      <div className='delete-family-actions'>
        <Button
          isBlock
          isDisabled={!isConfirmed}
          isPending={isPending}
          type='submit'
        >
          <BinIcon aria-hidden='true' />
          {translate('familyDeletion.dialog.confirm')}
        </Button>
        <Button
          isBlock
          isDisabled={isPending}
          onPress={onCancel}
          variant='ghost'
        >
          {translate('familyDeletion.dialog.cancel')}
        </Button>
      </div>
    </Form>
  )
}
