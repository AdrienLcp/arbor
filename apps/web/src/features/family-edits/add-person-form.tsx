import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { FiliationKind } from '@arbor/protocol/filiation'
import { SEXES } from '@arbor/protocol/person'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import {
  type CloseFamily,
  closeFamilyOf
} from '@arbor/core/relatives/close-family'
import {
  existingRelativeLinkOperations,
  linkRefusal
} from '@arbor/core/relatives/existing-relative-link'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { listedPeople } from '@/features/family-pages/family-people'
import { PersonLine } from '@/features/family-pages/person-line'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import { today } from '@/infrastructure/clock'
import { newEntityId } from '@/infrastructure/ids'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { TextField } from '@/presentation/components/text-field'
import { useFilter } from '@/presentation/components/use-filter'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { birthOfYear } from './birth-year'
import { EditFailureNotice } from './edit-failure-notice'
import { ExistingRelativePicker } from './existing-relative-picker'
import { existingTie } from './existing-tie'
import { LinkKindControl } from './link-kind-control'
import { firstParentKind } from './link-kinds'
import { linkRefusalKey } from './link-refusal-key'
import {
  childAddition,
  parentAddition,
  partnerAddition,
  siblingAddition,
  unplacedAddition
} from './relative-additions'
import type { AddingStart, Tie } from './tie'
import { TieTiles } from './tie-tiles'
import type { FamilyEdit } from './use-family-edit'

import './add-person-form.sass'

/** "Nobody": the child of a single parent. */
const NOBODY = 'nobody'

/** Typed letters before the tree offers the people it already holds under that name. */
const SUGGEST_FROM = 2
const SUGGESTED_AT_MOST = 3

/** A child of a person most often belongs to their latest union; else to them alone. */
const latestPartnerOf = (close: CloseFamily): EntityId | typeof NOBODY =>
  close.couples.findLast(({ partnerId }) => partnerId !== null)?.partnerId ??
  NOBODY

type AddPersonFormProps = {
  edit: FamilyEdit
  onDone: () => void
  start: AddingStart
}

/**
 * Someone added to the tree in one sentence: "Henri Dubois, they are the
 * brother of Claire Dubois". The same screen ties someone the tree already
 * holds, offered as their name is typed, and takes someone tied to no one
 * yet. Everything else is corrected later on their sheet.
 */
export const AddPersonForm: React.FC<AddPersonFormProps> = ({
  edit,
  onDone,
  start
}) => {
  const translate = useTranslate()
  const { family: response } = useOpenFamily()
  const faces = usePersonFaces()
  const { contains } = useFilter({ sensitivity: 'base' })
  const family = familyStateOfSnapshot(response.family)
  const lineage = familyLineage(family)

  const [anchorId, setAnchorId] = useState(start.anchorId)
  const [isChangingAnchor, setIsChangingAnchor] = useState(false)
  const [tie, setTie] = useState<Tie | null>(start.tie)
  const anchor = faces.get(anchorId)
  const close = closeFamilyOf(lineage, anchorId)
  const sharesSurname = start.tie === 'child' || start.tie === 'sibling'
  const [givenNames, setGivenNames] = useState('')
  const [surname, setSurname] = useState(
    sharesSurname ? (anchor?.surname ?? '') : ''
  )
  const [sex, setSex] = useState<(typeof SEXES)[number]>('unknown')
  const [birthYear, setBirthYear] = useState('')
  const [existingId, setExistingId] = useState<EntityId | null>(null)
  const [otherParent, setOtherParent] = useState(latestPartnerOf(close))
  const [chosenKind, setChosenKind] = useState<FiliationKind | null>(null)
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const birth = birthOfYear(birthYear)
  const anchorName = anchor?.givenNames || anchor?.name || ''
  const linkKind =
    chosenKind ?? (tie === 'parent' ? firstParentKind(close) : 'birth')
  const partners = close.couples.flatMap(({ partnerId }) =>
    partnerId === null ? [] : [partnerId]
  )
  const existing = existingId === null ? undefined : faces.get(existingId)
  const existingLink =
    existingId === null || tie === null || tie === 'none'
      ? null
      : existingTie({
          anchorId,
          kind: linkKind,
          relation: tie,
          relativeId: existingId
        })
  const refusal =
    existingLink === null ? null : linkRefusal(family, existingLink)

  const typedName = givenNames.trim()
  const suggestions =
    existingId !== null || typedName.length < SUGGEST_FROM
      ? []
      : listedPeople(response.family, today())
          .filter(
            ({ person }) =>
              person.id !== anchorId &&
              contains(person.givenNames, typedName) &&
              contains(person.surname, surname.trim())
          )
          .slice(0, SUGGESTED_AT_MOST)

  const chooseAnchor = (personId: EntityId) => {
    setAnchorId(personId)
    setIsChangingAnchor(false)
    setOtherParent(latestPartnerOf(closeFamilyOf(lineage, personId)))
    setChosenKind(null)
  }

  const newPersonOperations = () => {
    if (birth.status === 'failure' || tie === null) return null
    const person = {
      birth: birth.data,
      givenNames: typedName,
      sex,
      surname: surname.trim()
    }
    switch (tie) {
      case 'child':
        return childAddition({
          child: person,
          kind: linkKind,
          newId: newEntityId,
          otherParentId: otherParent === NOBODY ? null : otherParent,
          parentId: anchorId
        })
      case 'parent':
        return parentAddition({
          childId: anchorId,
          kind: linkKind,
          newId: newEntityId,
          parent: person
        })
      case 'partner':
        return partnerAddition({
          kind: 'unknown',
          newId: newEntityId,
          partner: person,
          personId: anchorId,
          start: null
        })
      case 'sibling':
        return siblingAddition({
          newId: newEntityId,
          parentFiliations: close.parentFiliations,
          personId: anchorId,
          sibling: person
        })
      case 'none':
        return unplacedAddition({ newId: newEntityId, person })
      default:
        return tie satisfies never
    }
  }

  const add = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (existing !== undefined) {
      if (existingLink === null) return
      const operations = existingRelativeLinkOperations(
        family,
        existingLink,
        newEntityId
      )
      if (operations.status === 'success' && refusal === null) {
        edit.save(operations.data, onDone)
      }
      return
    }
    const operations = newPersonOperations()
    if (operations !== null) edit.save(operations, onDone)
  }

  const saveLabel = () => {
    if (tie === null) return translate('add.chooseTie')
    if (existing !== undefined) {
      return translate('add.link', { name: existing.name })
    }
    return typedName === ''
      ? translate('add.saveUnnamed')
      : translate('add.save', { name: typedName })
  }

  return (
    <Form className='add-person-form' onSubmit={add}>
      {existing === undefined ? (
        <>
          <div className='add-person-names'>
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
          </div>
          {suggestions.length === 0 ? null : (
            <section className='add-person-already'>
              <h3 className='add-person-word'>{translate('add.already')}</h3>
              {suggestions.map((listed) => (
                <Button
                  className='add-person-suggestion'
                  key={listed.person.id}
                  onPress={() => setExistingId(listed.person.id)}
                  variant='quiet'
                >
                  <PersonLine isMe={false} listed={listed} />
                  <span className='add-person-pick'>
                    {translate('add.pick')}
                  </span>
                </Button>
              ))}
            </section>
          )}
        </>
      ) : (
        <div className='add-person-existing'>
          <span className='add-person-existing-name'>{existing.name}</span>
          <Button onPress={() => setExistingId(null)} variant='link'>
            {translate('add.someoneElse')}
          </Button>
        </div>
      )}
      <TieTiles onChange={setTie} value={tie} />
      {tie === null || tie === 'none' ? null : (
        <div className='add-person-row'>
          <span className='add-person-word'>
            {translate('add.anchor.label')}
          </span>
          {isChangingAnchor ? (
            <ExistingRelativePicker
              anchorId={anchorId}
              chosenId={null}
              onChoose={chooseAnchor}
              refusalOf={() => null}
            />
          ) : (
            <>
              <span className='add-person-anchor'>
                {anchor?.name ?? translate('common.unnamedPerson')}
              </span>
              <Button onPress={() => setIsChangingAnchor(true)} variant='link'>
                {translate('add.anchor.change')}
              </Button>
            </>
          )}
        </div>
      )}
      {tie === 'child' && existing === undefined && partners.length > 0 ? (
        <SegmentedControl
          label={translate('add.with')}
          onChange={setOtherParent}
          options={[
            ...partners.map((partnerId) => ({
              label:
                faces.get(partnerId)?.givenNames ||
                translate('common.unnamedPerson'),
              value: partnerId
            })),
            { label: translate('add.withNobody'), value: NOBODY }
          ]}
          value={otherParent}
        />
      ) : null}
      {existing === undefined ? (
        <div className='add-person-details'>
          <TextField
            autoComplete='off'
            errorMessage={translate('add.birthYearProblem')}
            inputMode='numeric'
            isInvalid={hasTriedSaving && birth.status === 'failure'}
            label={translate('add.birthYear')}
            onChange={setBirthYear}
            value={birthYear}
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
        </div>
      ) : null}
      {tie === 'child' || tie === 'parent' ? (
        <LinkKindControl
          name={anchorName}
          onChange={setChosenKind}
          relation={tie}
          value={linkKind}
        />
      ) : null}
      {refusal === null ? null : (
        <p className='add-person-refusal' role='status'>
          {translate(linkRefusalKey(refusal))}
        </p>
      )}
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <Button
        isBlock
        isDisabled={
          tie === null ||
          refusal !== null ||
          (existing !== undefined && tie === 'none')
        }
        isPending={edit.isPending}
        type='submit'
      >
        {saveLabel()}
      </Button>
    </Form>
  )
}
