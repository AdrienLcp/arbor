import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import { SEXES } from '@arbor/protocol/person'
import type { Union } from '@arbor/protocol/union'

import type { CloseFamily } from '@arbor/core/relatives/close-family'

import type { PersonFace } from '@/features/family-tree/person-face'
import { newEntityId } from '@/infrastructure/ids'
import { Button } from '@/presentation/components/button'
import { ChoiceList } from '@/presentation/components/choice-list'
import { Form } from '@/presentation/components/form'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { EditFailureNotice } from './edit-failure-notice'
import {
  type DateDraft,
  EMPTY_DATE_DRAFT,
  fuzzyDateOf
} from './fuzzy-date-draft'
import { FuzzyDateField } from './fuzzy-date-field'
import { occurrenceOf } from './occurrence-fields'
import type { Relation } from './relation'
import {
  childAddition,
  parentAddition,
  partnerAddition,
  siblingAddition
} from './relative-additions'
import type { FamilyEdit } from './use-family-edit'

import './add-relative-form.sass'

type AddRelativeFormProps = {
  /** The person the new relative is added to. */
  anchor: PersonFace
  close: CloseFamily
  edit: FamilyEdit
  faces: ReadonlyMap<EntityId, PersonFace>
  onDone: () => void
  relation: Relation
}

/** The kinds of link a form offers; "unknown" is for imports, never a choice made by hand. */
const LINK_KINDS = [
  'birth',
  'adoption',
  'step',
  'foster'
] as const satisfies readonly FiliationKind[]
const UNION_KINDS = [
  'marriage',
  'pacs',
  'partnership',
  'unknown'
] as const satisfies readonly Union['kind'][]

/** "No other parent known": the child of a single parent. */
const ALONE = 'alone'

/** A child of a person most often belongs to their latest union; else to them alone. */
const latestPartnerOf = (close: CloseFamily): EntityId | typeof ALONE =>
  close.couples.findLast(({ partnerId }) => partnerId !== null)?.partnerId ??
  ALONE

/** A child already has two parents by birth: a third one is most likely a step-parent. */
const firstParentKind = (close: CloseFamily): FiliationKind =>
  close.parentFiliations.filter(({ kind }) => kind === 'birth').length >= 2
    ? 'step'
    : 'birth'

/** A new relative of the person: who they are, when they were born, and how they are tied to the person. */
export const AddRelativeForm: React.FC<AddRelativeFormProps> = ({
  anchor,
  close,
  edit,
  faces,
  onDone,
  relation
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const sharesSurname = relation === 'child' || relation === 'sibling'
  const [givenNames, setGivenNames] = useState('')
  const [surname, setSurname] = useState(sharesSurname ? anchor.surname : '')
  const [sex, setSex] = useState<(typeof SEXES)[number]>('unknown')
  const [birthDate, setBirthDate] = useState<DateDraft>(EMPTY_DATE_DRAFT)
  const [birthPlace, setBirthPlace] = useState('')
  const [otherParent, setOtherParent] = useState(latestPartnerOf(close))
  const [linkKind, setLinkKind] = useState<FiliationKind>(
    relation === 'parent' ? firstParentKind(close) : 'birth'
  )
  const [unionKind, setUnionKind] = useState<Union['kind']>('marriage')
  const [unionDate, setUnionDate] = useState<DateDraft>(EMPTY_DATE_DRAFT)
  const [unionPlace, setUnionPlace] = useState('')
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const birth = fuzzyDateOf(birthDate)
  const unionStart = fuzzyDateOf(unionDate)
  const name = anchor.givenNames || anchor.name
  const nameOf = (personId: EntityId) =>
    faces.get(personId)?.name ?? translate('common.unnamedPerson')
  const partners = close.couples.flatMap(({ partnerId }) =>
    partnerId === null ? [] : [partnerId]
  )

  const addRelative = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (birth.status === 'failure' || unionStart.status === 'failure') return
    const relative = {
      birth: occurrenceOf(birth.data, birthPlace),
      givenNames: givenNames.trim(),
      sex,
      surname: surname.trim()
    }
    const operations = {
      child: () =>
        childAddition({
          child: relative,
          kind: linkKind,
          newId: newEntityId,
          otherParentId: otherParent === ALONE ? null : otherParent,
          parentId: anchor.id
        }),
      parent: () =>
        parentAddition({
          childId: anchor.id,
          kind: linkKind,
          newId: newEntityId,
          parent: relative
        }),
      partner: () =>
        partnerAddition({
          kind: unionKind,
          newId: newEntityId,
          partner: relative,
          personId: anchor.id,
          start: occurrenceOf(unionStart.data, unionPlace)
        }),
      sibling: () =>
        siblingAddition({
          newId: newEntityId,
          parentFiliations: close.parentFiliations,
          sibling: relative
        })
    }[relation]()
    edit.save(operations, onDone)
  }

  return (
    <Form className='add-relative-form' onSubmit={addRelative}>
      <TextField
        autoComplete='off'
        autoFocus
        label={translate('edit.person.givenNames')}
        onChange={setGivenNames}
        value={givenNames}
      />
      <TextField
        autoComplete='off'
        label={translate('edit.person.surname')}
        onChange={setSurname}
        value={surname}
      />
      <SegmentedControl
        label={translate('edit.person.sex')}
        onChange={setSex}
        options={SEXES.map((value) => ({
          label: translate(`edit.person.sexes.${value}`),
          value
        }))}
        value={sex}
      />
      {relation === 'child' ? (
        <div className='add-relative-link'>
          <ChoiceList
            label={translate('add.withWhom')}
            onChange={setOtherParent}
            options={[
              ...partners.map((partnerId) => ({
                label: translate('add.withPartner', {
                  name: nameOf(partnerId)
                }),
                value: partnerId
              })),
              { label: translate('add.alone'), value: ALONE }
            ]}
            value={otherParent}
          />
          <SegmentedControl
            label={translate('add.linkKind', { name })}
            onChange={setLinkKind}
            options={LINK_KINDS.map((value) => ({
              label: translate(`add.childKind.${value}`),
              value
            }))}
            value={linkKind}
          />
        </div>
      ) : null}
      {relation === 'parent' ? (
        <div className='add-relative-link'>
          <SegmentedControl
            label={translate('add.linkKind', { name })}
            onChange={setLinkKind}
            options={LINK_KINDS.map((value) => ({
              label: translate(`add.parentKind.${value}`),
              value
            }))}
            value={linkKind}
          />
        </div>
      ) : null}
      {relation === 'partner' ? (
        <div className='add-relative-link'>
          <SegmentedControl
            label={translate('add.unionKind.label')}
            onChange={setUnionKind}
            options={UNION_KINDS.map((value) => ({
              label: translate(`add.unionKind.${value}`),
              value
            }))}
            value={unionKind}
          />
          <FuzzyDateField
            label={translate('add.unionDate')}
            onChange={setUnionDate}
            problem={
              hasTriedSaving && unionStart.status === 'failure'
                ? unionStart.error
                : null
            }
            value={unionDate}
          />
          <TextField
            autoComplete='off'
            label={translate('add.unionPlace')}
            onChange={setUnionPlace}
            value={unionPlace}
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
        <FuzzyDateField
          label={translate('edit.person.birthDate')}
          onChange={setBirthDate}
          problem={
            hasTriedSaving && birth.status === 'failure' ? birth.error : null
          }
          value={birthDate}
        />
        <TextField
          autoComplete='off'
          label={translate('edit.person.birthPlace')}
          onChange={setBirthPlace}
          value={birthPlace}
        />
      </div>
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button isBlock isPending={edit.isPending} type='submit'>
        {translate('add.save')}
      </Button>
    </Form>
  )
}
