import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { FamilyState } from '@arbor/core/family/family-state'
import type { CloseFamily } from '@arbor/core/relatives/close-family'
import {
  type ExistingRelativeLink,
  existingRelativeLinkOperations,
  linkRefusal
} from '@arbor/core/relatives/existing-relative-link'
import type { Relation } from '@arbor/core/relatives/relation'

import type { PersonFace } from '@/features/family-tree/person-face'
import { newEntityId } from '@/infrastructure/ids'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { EditFailureNotice } from './edit-failure-notice'
import { ExistingRelativePicker } from './existing-relative-picker'
import { EMPTY_DATE_DRAFT, fuzzyDateOf } from './fuzzy-date-draft'
import { LinkKindControl } from './link-kind-control'
import { firstParentKind } from './link-kinds'
import { occurrenceOf } from './occurrence-fields'
import { UnionStartFields } from './union-start-fields'
import type { FamilyEdit } from './use-family-edit'

import './add-relative-form.sass'

type LinkRelativeFormProps = {
  /** The person the relative is tied to. */
  anchor: PersonFace
  close: CloseFamily
  edit: FamilyEdit
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
  onDone: () => void
  relation: Relation
}

/** Ties the person to someone already in the tree: how, then who, among the people the family would accept. */
export const LinkRelativeForm: React.FC<LinkRelativeFormProps> = ({
  anchor,
  close,
  edit,
  faces,
  family,
  onDone,
  relation
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const [chosenId, setChosenId] = useState<EntityId | null>(null)
  const [linkKind, setLinkKind] = useState<FiliationKind>(
    relation === 'parent' ? firstParentKind(close) : 'birth'
  )
  const [unionKind, setUnionKind] = useState<Union['kind']>('marriage')
  const [unionDate, setUnionDate] = useState(EMPTY_DATE_DRAFT)
  const [unionPlace, setUnionPlace] = useState('')
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const unionStart = fuzzyDateOf(unionDate)
  const name = anchor.givenNames || anchor.name
  const nameOf = (personId: EntityId) =>
    faces.get(personId)?.name ?? translate('common.unnamedPerson')

  const linkTo = (relativeId: EntityId): ExistingRelativeLink => {
    const ends = { anchorId: anchor.id, relativeId }
    switch (relation) {
      case 'child':
      case 'parent':
        return { ...ends, kind: linkKind, relation }
      case 'partner':
        return {
          ...ends,
          kind: unionKind,
          relation,
          start:
            unionStart.status === 'success'
              ? occurrenceOf(unionStart.data, unionPlace)
              : null
        }
      case 'sibling':
        return { ...ends, relation }
    }
  }

  const refusalOf = (personId: EntityId) =>
    linkRefusal(family, linkTo(personId))
  const chosen =
    chosenId !== null && refusalOf(chosenId) === null ? chosenId : null

  const link = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (chosen === null || unionStart.status === 'failure') return
    const operations = existingRelativeLinkOperations(
      family,
      linkTo(chosen),
      newEntityId
    )
    if (operations.status === 'failure') return
    edit.save(operations.data, onDone)
  }

  return (
    <Form className='add-relative-form' onSubmit={link}>
      {relation === 'child' || relation === 'parent' ? (
        <LinkKindControl
          name={name}
          onChange={setLinkKind}
          relation={relation}
          value={linkKind}
        />
      ) : null}
      {relation === 'partner' ? (
        <div className='add-relative-fields'>
          <UnionStartFields
            date={unionDate}
            dateProblem={
              hasTriedSaving && unionStart.status === 'failure'
                ? unionStart.error
                : null
            }
            kind={unionKind}
            onDateChange={setUnionDate}
            onKindChange={setUnionKind}
            onPlaceChange={setUnionPlace}
            place={unionPlace}
          />
        </div>
      ) : null}
      {relation === 'sibling' ? (
        <p className='add-relative-note'>
          {translate('add.siblingParents', {
            name,
            names: wordList(
              close.parentFiliations.map(({ parentId }) => nameOf(parentId))
            )
          })}
        </p>
      ) : null}
      <div className='add-relative-link'>
        <ExistingRelativePicker
          anchorId={anchor.id}
          chosenId={chosen}
          onChoose={setChosenId}
          refusalOf={refusalOf}
        />
      </div>
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button
        isBlock
        isDisabled={chosen === null}
        isPending={edit.isPending}
        type='submit'
      >
        {chosen === null
          ? translate('add.existing.chooseFirst')
          : translate('add.existing.save', { name: nameOf(chosen) })}
      </Button>
    </Form>
  )
}
