import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import type { FamilyState } from '@arbor/core/family/family-state'
import {
  existingRelativeLinkOperations,
  linkRefusal
} from '@arbor/core/relatives/existing-relative-link'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import {
  EMPTY_DATE_DRAFT,
  fuzzyDateOf
} from '@/features/family-edits/fuzzy-date-draft'
import { LinkKindControl } from '@/features/family-edits/link-kind-control'
import { linkRefusalKey } from '@/features/family-edits/link-refusal-key'
import { occurrenceOf } from '@/features/family-edits/occurrence-fields'
import { UnionStartFields } from '@/features/family-edits/union-start-fields'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import type { PersonFace } from '@/features/family-tree/person-face'
import { newEntityId } from '@/infrastructure/ids'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { PreviousIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { defaultFiliationKind, treeLinkOf } from './tree-link-of'
import type { TreeLinkKind } from './tree-link-step'

import './tree-link-confirm-form.sass'

type TreeLinkConfirmFormProps = {
  edit: FamilyEdit
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
  firstId: EntityId
  kind: TreeLinkKind
  onDone: () => void
  onChooseOther: () => void
  secondId: EntityId
}

/** The link between the two people touched, spelled out in a sentence, with how a couple began or how a child is tied, then saved. */
export const TreeLinkConfirmForm: React.FC<TreeLinkConfirmFormProps> = ({
  edit,
  faces,
  family,
  firstId,
  kind,
  onDone,
  onChooseOther,
  secondId
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const [filiationKind, setFiliationKind] = useState<FiliationKind>(
    defaultFiliationKind(family, secondId)
  )
  const [unionKind, setUnionKind] = useState<Union['kind']>('marriage')
  const [unionDate, setUnionDate] = useState(EMPTY_DATE_DRAFT)
  const [unionPlace, setUnionPlace] = useState('')
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const nameOf = (personId: EntityId) =>
    faces.get(personId)?.name ?? translate('common.unnamedPerson')
  const unionStart = fuzzyDateOf(unionDate)
  const link = treeLinkOf({
    details: {
      filiationKind,
      unionKind,
      unionStart:
        unionStart.status === 'success'
          ? occurrenceOf(unionStart.data, unionPlace)
          : null
    },
    family,
    firstId,
    kind,
    secondId
  })
  const refusal = linkRefusal(family, link)

  const sentence = () => {
    switch (link.relation) {
      case 'partner':
        return translate('link.confirm.couple', {
          first: nameOf(firstId),
          second: nameOf(secondId)
        })
      case 'sibling':
        return translate('link.confirm.siblings', {
          anchor: nameOf(link.anchorId),
          parents: wordList(
            family.filiations
              .values()
              .filter(({ childId }) => childId === link.anchorId)
              .map(({ parentId }) => nameOf(parentId))
              .toArray()
          ),
          relative: nameOf(link.relativeId)
        })
      default:
        return translate('link.confirm.parentChild', {
          child: nameOf(link.relativeId),
          parent: nameOf(link.anchorId)
        })
    }
  }

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (refusal !== null || unionStart.status === 'failure') return
    const operations = existingRelativeLinkOperations(family, link, newEntityId)
    if (operations.status === 'failure') return
    edit.save(operations.data, onDone)
  }

  return (
    <Form className='tree-link-confirm' onSubmit={save}>
      <p className='tree-link-sentence'>{sentence()}</p>
      {kind === 'parentChild' ? (
        <LinkKindControl
          name={faces.get(firstId)?.givenNames || nameOf(firstId)}
          onChange={setFiliationKind}
          relation='child'
          value={filiationKind}
        />
      ) : null}
      {kind === 'couple' ? (
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
      ) : null}
      {refusal === null ? null : (
        <p className='tree-link-refusal' role='status'>
          {translate(linkRefusalKey(refusal))}
        </p>
      )}
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button
        isBlock
        isDisabled={refusal !== null}
        isPending={edit.isPending}
        type='submit'
      >
        {translate('link.confirm.save')}
      </Button>
      <Button
        className='tree-link-other'
        onPress={onChooseOther}
        variant='link'
      >
        <PreviousIcon aria-hidden='true' />
        {translate('link.confirm.other')}
      </Button>
    </Form>
  )
}
