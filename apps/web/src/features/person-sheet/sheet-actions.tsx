import type React from 'react'
import { useState } from 'react'

import type { FamilyId } from '@arbor/protocol/access'
import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import type { FamilyState } from '@arbor/core/family/family-state'

import {
  type Adding,
  AddRelativeDialog
} from '@/features/family-edits/add-relative-dialog'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { WhoFirstNotice } from '@/features/family-edits/who-first-notice'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import type { PersonFace } from '@/features/family-tree/person-face'
import { familyHistoryPathFor } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { FormDialog } from '@/presentation/components/form-dialog'
import { AddIcon, EditIcon, HistoryIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { BinPersonAction } from './bin-person-action'
import { EditPersonForm } from './edit-person-form'

import './sheet-actions.sass'

const HistoryLink: React.FC<{ familyId: FamilyId; personId: EntityId }> = ({
  familyId,
  personId
}) => {
  const translate = useTranslate()
  return (
    <ButtonLink
      className='sheet-history'
      href={familyHistoryPathFor({ familyId, personId })}
      variant='link'
    >
      <HistoryIcon aria-hidden='true' />
      {translate('sheet.history')}
    </ButtonLink>
  )
}

type SheetActionsProps = {
  face: PersonFace
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
  person: Person
}

/** What a relative can do from a sheet; nothing on a reader's link, and first "who are you?" for an unsigned visitor. */
export const SheetActions: React.FC<SheetActionsProps> = ({
  face,
  faces,
  family,
  person
}) => {
  const translate = useTranslate()
  const { familyId } = useOpenFamily()
  const edit = useFamilyEdit()
  const [isEditing, setIsEditing] = useState(false)
  const [adding, setAdding] = useState<Adding | null>(null)

  if (!edit.canEdit) return null

  if (edit.author === null) {
    return (
      <div className='sheet-actions'>
        <WhoFirstNotice />
        <HistoryLink familyId={familyId} personId={face.id} />
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
      <HistoryLink familyId={familyId} personId={face.id} />
      <BinPersonAction edit={edit} face={face} faces={faces} family={family} />
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
