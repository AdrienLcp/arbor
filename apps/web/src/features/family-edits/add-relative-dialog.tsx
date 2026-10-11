import type React from 'react'
import { useState } from 'react'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { closeFamilyOf } from '@arbor/core/relatives/close-family'
import { RELATIONS, type Relation } from '@arbor/core/relatives/relation'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import type { PersonFace } from '@/features/family-tree/person-face'
import { Button } from '@/presentation/components/button'
import { ChoiceButtons } from '@/presentation/components/choice-buttons'
import { FormDialog } from '@/presentation/components/form-dialog'
import { PreviousIcon } from '@/presentation/components/icons'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { AddRelativeForm } from './add-relative-form'
import { LinkRelativeForm } from './link-relative-form'
import { useFamilyEdit } from './use-family-edit'

import './add-relative-dialog.sass'

/** What the add dialog shows: the choice of a link, or the form for one. */
export type Adding = Relation | 'choose'

/** Whether the relative is someone new to the tree or someone it already holds. */
const WHO_CHOICES = ['new', 'existing'] as const
type Who = (typeof WHO_CHOICES)[number]

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
  const [who, setWho] = useState<Who>('new')
  const family = familyStateOfSnapshot(response.family)
  const close = closeFamilyOf(familyLineage(family), anchor.id)
  const name = anchor.givenNames || anchor.name
  const hasParents = close.parentFiliations.length > 0

  const closeDialog = () => {
    edit.dismissFailure()
    setWho('new')
    onChange(null)
  }
  const chooseAgain = () => {
    edit.dismissFailure()
    onChange('choose')
  }
  const chooseWho = (chosen: Who) => {
    edit.dismissFailure()
    setWho(chosen)
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
        <ChoiceButtons
          choices={RELATIONS.map((relation) => {
            const isPossible = relation !== 'sibling' || hasParents
            return {
              hint: isPossible
                ? translate(`add.relation.${relation}.hint`, { name })
                : translate('add.relation.sibling.needsParent'),
              id: relation,
              isDisabled: !isPossible,
              onPress: () => onChange(relation),
              title: translate(`add.relation.${relation}.title`)
            }
          })}
        />
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
          <SegmentedControl
            className='add-relative-who'
            label={translate('add.who.label')}
            onChange={chooseWho}
            options={WHO_CHOICES.map((value) => ({
              label: translate(`add.who.${value}`),
              value
            }))}
            value={who}
          />
          {who === 'new' ? (
            <AddRelativeForm
              anchor={anchor}
              close={close}
              edit={edit}
              faces={faces}
              key={adding}
              onDone={closeDialog}
              relation={adding}
            />
          ) : (
            <LinkRelativeForm
              anchor={anchor}
              close={close}
              edit={edit}
              faces={faces}
              family={family}
              key={adding}
              onDone={closeDialog}
              relation={adding}
            />
          )}
        </>
      )}
    </FormDialog>
  )
}
