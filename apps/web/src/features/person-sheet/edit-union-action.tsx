import type React from 'react'
import { useState } from 'react'

import type { Union } from '@arbor/protocol/union'

import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { Button } from '@/presentation/components/button'
import { FormDialog } from '@/presentation/components/form-dialog'
import { EditIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { EditUnionForm } from './edit-union-form'

type EditUnionActionProps = {
  /** The partners as the dialog's title names them. */
  partnerNames: readonly string[]
  union: Union
}

/** The link that fixes a couple, under it on a sheet, for a relative who said who they are. */
export const EditUnionAction: React.FC<EditUnionActionProps> = ({
  partnerNames,
  union
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const edit = useFamilyEdit()
  const [isEditing, setIsEditing] = useState(false)

  if (!edit.canEdit || edit.author === null) return null

  const closeEditing = () => {
    edit.dismissFailure()
    setIsEditing(false)
  }

  return (
    <>
      <Button
        className='sheet-union-edit'
        onPress={() => setIsEditing(true)}
        variant='link'
      >
        <EditIcon aria-hidden='true' />
        {translate('union.edit.open')}
      </Button>
      <FormDialog
        closeLabel={translate('edit.cancel')}
        isOpen={isEditing}
        isPending={edit.isPending}
        onClose={closeEditing}
        title={translate('union.edit.title', {
          names: wordList(partnerNames)
        })}
      >
        <EditUnionForm edit={edit} onDone={closeEditing} union={union} />
      </FormDialog>
    </>
  )
}
