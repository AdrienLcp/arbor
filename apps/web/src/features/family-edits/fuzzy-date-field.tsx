import type React from 'react'
import { useId } from 'react'

import { Select } from '@/presentation/components/select'
import { TextField } from '@/presentation/components/text-field'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import {
  DATE_QUALIFIERS,
  type DateDraft,
  type DateDraftProblem,
  type PointDraft
} from './fuzzy-date-draft'
import { monthNames } from './month-names'

import './fuzzy-date-field.sass'

type FuzzyDateFieldProps = {
  /** What the date is of: "Date de naissance". */
  label: string
  onChange: (draft: DateDraft) => void
  /** Why the typed date cannot be kept yet, shown under the fields. */
  problem: DateDraftProblem | null
  value: DateDraft
}

/** No month typed: the year alone, or a day and year without a month, is still a date worth keeping. */
const NO_MONTH = ''

const PointFields: React.FC<{
  label: string
  onChange: (point: PointDraft) => void
  value: PointDraft
}> = ({ label, onChange, value }) => {
  const translate = useTranslate()
  const locale = useLocale()
  const months = [
    { label: translate('edit.date.noMonth'), value: NO_MONTH },
    ...monthNames(locale).map((name, index) => ({
      label: name,
      value: String(index + 1)
    }))
  ]

  return (
    <fieldset aria-label={label} className='fuzzy-date-point'>
      <TextField
        className='fuzzy-date-day'
        inputMode='numeric'
        label={translate('edit.date.day')}
        maxLength={2}
        onChange={(day) => onChange({ ...value, day })}
        value={value.day}
      />
      <Select
        className='fuzzy-date-month'
        label={translate('edit.date.month')}
        onChange={(month) => onChange({ ...value, month })}
        options={months}
        value={value.month}
      />
      <TextField
        className='fuzzy-date-year'
        inputMode='numeric'
        label={translate('edit.date.year')}
        maxLength={4}
        onChange={(year) => onChange({ ...value, year })}
        value={value.year}
      />
    </fieldset>
  )
}

/** A date as the family knows it: exact, about, before, after or between two, from a year alone to a full day. */
export const FuzzyDateField: React.FC<FuzzyDateFieldProps> = ({
  label,
  onChange,
  problem,
  value
}) => {
  const translate = useTranslate()
  const hintId = useId()
  const isSpan = value.qualifier === 'between'

  return (
    <fieldset aria-describedby={hintId} className='fuzzy-date-field'>
      <legend className='fuzzy-date-legend'>{label}</legend>
      <Select
        label={translate('edit.date.certainty')}
        onChange={(qualifier) => onChange({ ...value, qualifier })}
        options={DATE_QUALIFIERS.map((qualifier) => ({
          label: translate(`edit.date.qualifier.${qualifier}`),
          value: qualifier
        }))}
        value={value.qualifier}
      />
      <PointFields
        label={translate(isSpan ? 'edit.date.from' : 'edit.date.when')}
        onChange={(from) => onChange({ ...value, from })}
        value={value.from}
      />
      {isSpan ? (
        <>
          <p aria-hidden='true' className='fuzzy-date-and'>
            {translate('edit.date.and')}
          </p>
          <PointFields
            label={translate('edit.date.to')}
            onChange={(to) => onChange({ ...value, to })}
            value={value.to}
          />
        </>
      ) : null}
      <p className='fuzzy-date-hint' id={hintId}>
        {translate('edit.date.hint')}
      </p>
      {problem === null ? null : (
        <p className='fuzzy-date-problem' role='alert'>
          {translate(`edit.date.problem.${problem}`)}
        </p>
      )}
    </fieldset>
  )
}
