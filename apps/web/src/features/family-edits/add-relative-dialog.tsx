import type React from 'react'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { closeFamilyOf } from '@arbor/core/relatives/close-family'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import type { PersonFace } from '@/features/family-tree/person-face'
import { Button } from '@/presentation/components/button'
import { FormDialog } from '@/presentation/components/form-dialog'
import { PreviousIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { AddRelativeForm } from './add-relative-form'
import { RELATIONS, type Relation } from './relation'
import { useFamilyEdit } from './use-family-edit'

import './add-relative-dialog.sass'

/** What the add dialog shows: the choice of a link, or the form for one. */
export type Adding = Relation | 'choose'

type AddRelativeDialogProps = {
  /** `null` while the dialog is closed. */
  adding: Adding | null
  anchor: PersonFace
  onChange: (adding: Adding | null) => void
}

/** Adds a child, a parent, a partner or a brother or sister to a person, in one save. */
export const AddRelativeDialog: React.FC<AddRelativeDialogProps> = ({
  adding,
  anchor,
  onChange
}) => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()
  const faces = usePersonFaces()
  const edit = useFamilyEdit()
  const close = closeFamilyOf(
    familyLineage(familyStateOfSnapshot(response.family)),
    anchor.id
  )
  const name = anchor.givenNames || anchor.name
  const hasParents = close.parentFiliations.length > 0

  const closeDialog = () => {
    edit.dismissFailure()
    onChange(null)
  }
  const chooseAgain = () => {
    edit.dismissFailure()
    onChange('choose')
  }

  return (
    <FormDialog
      closeLabel={translate('edit.cancel')}
      isOpen={adding !== null}
      isPending={edit.isPending}
      onClose={closeDialog}
      title={
        adding === null || adding === 'choose'
          ? translate('add.title', { name })
          : translate(`add.relation.${adding}.dialog`, { name })
      }
    >
      {adding === 'choose' ? (
        <ul className='add-relative-choices'>
          {RELATIONS.map((relation) => {
            const isPossible = relation !== 'sibling' || hasParents
            return (
              <li key={relation}>
                <Button
                  className='add-relative-choice'
                  isBlock
                  isDisabled={!isPossible}
                  onPress={() => onChange(relation)}
                  variant='quiet'
                >
                  <span className='add-relative-choice-title'>
                    {translate(`add.relation.${relation}.title`)}
                  </span>
                  <span className='add-relative-choice-hint'>
                    {isPossible
                      ? translate(`add.relation.${relation}.hint`, { name })
                      : translate('add.relation.sibling.needsParent')}
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {adding === null || adding === 'choose' ? null : (
        <>
          <Button
            className='add-relative-back'
            onPress={chooseAgain}
            variant='link'
          >
            <PreviousIcon aria-hidden='true' />
            {translate('add.otherChoice')}
          </Button>
          <AddRelativeForm
            anchor={anchor}
            close={close}
            edit={edit}
            faces={faces}
            key={adding}
            onDone={closeDialog}
            relation={adding}
          />
        </>
      )}
    </FormDialog>
  )
}
