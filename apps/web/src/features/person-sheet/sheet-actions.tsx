import type React from 'react'
import { useState } from 'react'

import type { Person } from '@arbor/protocol/person'

import {
  type Adding,
  AddRelativeDialog
} from '@/features/family-edits/add-relative-dialog'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import type { PersonFace } from '@/features/family-tree/person-face'
import { whoAmIPathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { FormDialog } from '@/presentation/components/form-dialog'
import { AddIcon, EditIcon, PersonIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { EditPersonForm } from './edit-person-form'

import './sheet-actions.sass'

type SheetActionsProps = {
  face: PersonFace
  person: Person
}

/** What a relative can do from a sheet; nothing on a reader's link, and first "who are you?" for an unsigned visitor. */
export const SheetActions: React.FC<SheetActionsProps> = ({ face, person }) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const edit = useFamilyEdit()
  const [isEditing, setIsEditing] = useState(false)
  const [adding, setAdding] = useState<Adding | null>(null)

  if (!edit.canEdit) return null

  if (edit.author === null) {
    return (
      <div className='sheet-actions'>
        <p className='sheet-actions-note'>{translate('edit.whoFirst')}</p>
        <ButtonLink href={whoAmIPathFor(familyId)} isBlock variant='ghost'>
          <PersonIcon aria-hidden='true' />
          {translate('edit.whoFirstAction')}
        </ButtonLink>
      </div>
    )
  }

  const closeEditing = () => {
    edit.dismissFailure()
    setIsEditing(false)
  }

  return (
    <div className='sheet-actions'>
      <Button isBlock onPress={() => setAdding('choose')}>
        <AddIcon aria-hidden='true' />
        {translate('add.open')}
      </Button>
      <Button isBlock onPress={() => setIsEditing(true)} variant='ghost'>
        <EditIcon aria-hidden='true' />
        {translate('edit.person.open')}
      </Button>
      <FormDialog
        closeLabel={translate('edit.cancel')}
        isOpen={isEditing}
        isPending={edit.isPending}
        onClose={closeEditing}
        title={translate('edit.person.title', { name: face.name })}
      >
        <EditPersonForm edit={edit} onDone={closeEditing} person={person} />
      </FormDialog>
      <AddRelativeDialog adding={adding} anchor={face} onChange={setAdding} />
    </div>
  )
}
