import type React from 'react'

import { FormDialog } from '@/presentation/components/form-dialog'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { AddPersonForm } from './add-person-form'
import type { AddingStart } from './tie'
import { useFamilyEdit } from './use-family-edit'

type AddPersonDialogProps = {
  onClose: () => void
  /** `null` while the dialog is closed. */
  start: AddingStart | null
}

/** "Add someone", over whatever screen opened it: the tree's add button, a sheet's empty group, an unknown parent. */
export const AddPersonDialog: React.FC<AddPersonDialogProps> = ({
  onClose,
  start
}) => {
  const translate = useTranslate()
  const edit = useFamilyEdit()

  const close = () => {
    edit.dismissFailure()
    onClose()
  }

  return (
    <FormDialog
      closeLabel={translate('edit.cancel')}
      isOpen={start !== null}
      isPending={edit.isPending}
      onClose={close}
      title={translate('add.title')}
    >
      {start === null ? null : (
        <AddPersonForm
          edit={edit}
          key={`${start.anchorId}-${start.tie}`}
          onDone={close}
          start={start}
        />
      )}
    </FormDialog>
  )
}
