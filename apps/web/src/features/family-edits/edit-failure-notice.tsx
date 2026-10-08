import type React from 'react'

import type { OperationRefusal } from '@arbor/protocol/operation-refusal'

import { FailureNotice } from '@/presentation/components/failure-notice'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { useAuthorName } from './use-author-name'
import type { EditFailure } from './use-family-edit'

/** The refusals a visitor can cause from a form, each told in its own words; any other means the tree changed under them. */
const TOLD_REFUSALS = [
  'ancestry_cycle',
  'person_binned',
  'same_partner',
  'too_many_birth_parents'
] as const satisfies readonly OperationRefusal[]
type ToldRefusal = (typeof TOLD_REFUSALS)[number]

const isTold = (refusal: OperationRefusal): refusal is ToldRefusal =>
  TOLD_REFUSALS.some((told) => told === refusal)

/** Says in one line why a save did not go through, and what to do next. */
export const EditFailureNotice: React.FC<{ failure: EditFailure }> = ({
  failure
}) => {
  const translate = useTranslate()
  const wordList = useWordList()
  const nameOf = useAuthorName()

  const message = (): string => {
    switch (failure.kind) {
      case 'family_moved':
        return failure.authors.length === 0
          ? translate('edit.failure.movedBySomeone')
          : translate('edit.failure.movedBy', {
              names: wordList(failure.authors.map(nameOf))
            })
      case 'refused':
        return isTold(failure.refusal)
          ? translate(`edit.failure.refused.${failure.refusal}`)
          : translate('edit.failure.refused.other')
      case 'not_sent':
        return translate('common.failed')
      default:
        return failure satisfies never
    }
  }

  return <FailureNotice>{message()}</FailureNotice>
}
