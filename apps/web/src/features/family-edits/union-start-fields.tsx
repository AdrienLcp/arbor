import type React from 'react'

import { UNION_KINDS, type Union } from '@arbor/protocol/union'

import { SegmentedControl } from '@/presentation/components/segmented-control'
import { TextField } from '@/presentation/components/text-field'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { DateDraft, DateDraftProblem } from './fuzzy-date-draft'
import { FuzzyDateField } from './fuzzy-date-field'

type UnionStartFieldsProps = {
  date: DateDraft
  /** What is wrong with the date, once a save was tried. */
  dateProblem: DateDraftProblem | null
  kind: Union['kind']
  onDateChange: (date: DateDraft) => void
  onKindChange: (kind: Union['kind']) => void
  onPlaceChange: (place: string) => void
  place: string
}

/** How a couple began: married, PACS or living together, when and where. */
export const UnionStartFields: React.FC<UnionStartFieldsProps> = ({
  date,
  dateProblem,
  kind,
  onDateChange,
  onKindChange,
  onPlaceChange,
  place
}) => {
  const translate = useTranslate()

  return (
    <>
      <SegmentedControl
        label={translate('union.kind.label')}
        onChange={onKindChange}
        options={UNION_KINDS.map((value) => ({
          label: translate(`union.kind.${value}`),
          value
        }))}
        value={kind}
      />
      <FuzzyDateField
        label={translate('union.date')}
        onChange={onDateChange}
        problem={dateProblem}
        value={date}
      />
      <TextField
        autoComplete='off'
        label={translate('union.place')}
        onChange={onPlaceChange}
        value={place}
      />
    </>
  )
}
