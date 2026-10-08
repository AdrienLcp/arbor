import type React from 'react'
import { useState } from 'react'

import { UNION_ENDINGS, UNION_KINDS, type Union } from '@arbor/protocol/union'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import {
  type DateDraft,
  dateDraftOf,
  fuzzyDateOf
} from '@/features/family-edits/fuzzy-date-draft'
import { FuzzyDateField } from '@/features/family-edits/fuzzy-date-field'
import { occurrenceOf } from '@/features/family-edits/occurrence-fields'
import { unionUpdate } from '@/features/family-edits/union-update'
import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { SegmentedControl } from '@/presentation/components/segmented-control'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './sheet-edit-form.sass'

/** A union still going, or how it ended: a partner's death ends it on its own, so it is never offered. */
const ENDINGS = ['none', ...UNION_ENDINGS] as const
type Ending = (typeof ENDINGS)[number]

type EditUnionFormProps = {
  edit: FamilyEdit
  onDone: () => void
  union: Union
}

/** Fixes a couple's kind and start, and records how it ended: a separation or a divorce, the date if known. */
export const EditUnionForm: React.FC<EditUnionFormProps> = ({
  edit,
  onDone,
  union
}) => {
  const translate = useTranslate()
  const [kind, setKind] = useState(union.kind)
  const [startDate, setStartDate] = useState<DateDraft>(
    dateDraftOf(union.start?.date ?? null)
  )
  const [startPlace, setStartPlace] = useState(union.start?.place ?? '')
  const [ending, setEnding] = useState<Ending>(union.end?.kind ?? 'none')
  const [endDate, setEndDate] = useState<DateDraft>(
    dateDraftOf(union.end?.date ?? null)
  )
  const [hasTriedSaving, setHasTriedSaving] = useState(false)

  const start = fuzzyDateOf(startDate)
  const end = fuzzyDateOf(endDate)
  const hasEnded = ending !== 'none'

  const saveEdits = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSaving(true)
    if (start.status === 'failure') return
    if (hasEnded && end.status === 'failure') return
    const update = unionUpdate(union, {
      end: hasEnded
        ? {
            date: end.status === 'success' ? end.data : null,
            kind: ending,
            // The form asks no place for an ending; one already known stays.
            place: union.end?.place ?? null
          }
        : null,
      kind,
      start: occurrenceOf(start.data, startPlace)
    })
    if (update === null) {
      onDone()
      return
    }
    edit.save([update], onDone)
  }

  return (
    <Form className='sheet-edit-form' onSubmit={saveEdits}>
      <SegmentedControl
        label={translate('union.kind.label')}
        onChange={setKind}
        options={UNION_KINDS.map((value) => ({
          label: translate(`union.kind.${value}`),
          value
        }))}
        value={kind}
      />
      <div className='sheet-edit-occurrence'>
        <FuzzyDateField
          label={translate('union.date')}
          onChange={setStartDate}
          problem={
            hasTriedSaving && start.status === 'failure' ? start.error : null
          }
          value={startDate}
        />
        <TextField
          autoComplete='off'
          label={translate('union.place')}
          onChange={setStartPlace}
          value={startPlace}
        />
      </div>
      <div className='sheet-edit-occurrence'>
        <SegmentedControl
          label={translate('union.end.label')}
          onChange={setEnding}
          options={ENDINGS.map((value) => ({
            label: translate(`union.end.${value}`),
            value
          }))}
          value={ending}
        />
        {hasEnded ? (
          <FuzzyDateField
            label={translate('union.end.date')}
            onChange={setEndDate}
            problem={
              hasTriedSaving && end.status === 'failure' ? end.error : null
            }
            value={endDate}
          />
        ) : null}
      </div>
      {edit.failure === null ? null : (
        <EditFailureNotice failure={edit.failure} />
      )}
      <div className='sheet-edit-actions'>
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
