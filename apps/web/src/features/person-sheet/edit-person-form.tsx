import type React from 'react'
import { useState } from 'react'

import { type Person, SEXES } from '@arbor/protocol/person'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import {
  type DateDraft,
  dateDraftOf,
  fuzzyDateOf
} from '@/features/family-edits/fuzzy-date-draft'
import { FuzzyDateField } from '@/features/family-edits/fuzzy-date-field'
import {
  occurrenceOf,
  textOrNull
} from '@/features/family-edits/occurrence-fields'
import { personUpdate } from '@/features/family-edits/person-update'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { TextAreaField } from '@/presentation/components/text-area-field'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './edit-person-form.sass'

type EditPersonFormProps = {
  edit: FamilyEdit
  onDone: () => void
  person: Person
}

/** Fixes what the family knows of a person: names, sex, birth, death when recorded, notes. */
export const EditPersonForm: React.FC<EditPersonFormProps> = ({
  edit,
  onDone,
  person
}) => {
  const translate = useTranslate()
  const [givenNames, setGivenNames] = useState(person.givenNames)
  const [surname, setSurname] = useState(person.surname)
  const [birthSurname, setBirthSurname] = useState(person.birthSurname ?? '')
  const [sex, setSex] = useState(person.sex)
  const [birthDate, setBirthDate] = useState<DateDraft>(
    dateDraftOf(person.birth?.date ?? null)
  )
  const [birthPlace, setBirthPlace] = useState(person.birth?.place ?? '')
  const [deathDate, setDeathDate] = useState<DateDraft>(
    dateDraftOf(person.death?.date ?? null)
  )
  const [deathPlace, setDeathPlace] = useState(person.death?.place ?? '')
  const [notes, setNotes] = useState(person.notes)
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const birth = fuzzyDateOf(birthDate)
  const death = fuzzyDateOf(deathDate)
  const isDeceased = person.death !== null

  const saveEdits = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (birth.status === 'failure' || death.status === 'failure') return
    const update = personUpdate(person, {
      birth: occurrenceOf(birth.data, birthPlace),
      birthSurname: textOrNull(birthSurname),
      // A recorded death stays recorded with nothing known about it: "died, details unknown".
      death: isDeceased
        ? { date: death.data, place: textOrNull(deathPlace) }
        : null,
      givenNames: givenNames.trim(),
      notes: notes.trim(),
      sex,
      surname: surname.trim()
    })
    if (update === null) {
      onDone()
      return
    }
    edit.save([update], onDone)
  }

  return (
    <Form className='edit-person-form' onSubmit={saveEdits}>
      <TextField
        autoComplete='off'
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
      <TextField
        autoComplete='off'
        description={translate('edit.person.birthSurnameHint')}
        label={translate('edit.person.birthSurname')}
        onChange={setBirthSurname}
        value={birthSurname}
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
      <div className='edit-person-occurrence'>
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
      {isDeceased ? (
        <div className='edit-person-occurrence'>
          <FuzzyDateField
            label={translate('edit.person.deathDate')}
            onChange={setDeathDate}
            problem={
              hasTriedSaving && death.status === 'failure' ? death.error : null
            }
            value={deathDate}
          />
          <TextField
            autoComplete='off'
            label={translate('edit.person.deathPlace')}
            onChange={setDeathPlace}
            value={deathPlace}
          />
        </div>
      ) : null}
      <TextAreaField
        description={translate('edit.person.notesHint')}
        label={translate('sheet.notes')}
        onChange={setNotes}
        value={notes}
      />
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <div className='edit-person-actions'>
        <Button isBlock isPending={edit.isPending} type='submit'>
          {translate('edit.save')}
        </Button>
        <Button
          isBlock
          isDisabled={edit.isPending}
          onPress={onDone}
          variant='ghost'
        >
          {translate('edit.cancel')}
        </Button>
      </div>
    </Form>
  )
}
