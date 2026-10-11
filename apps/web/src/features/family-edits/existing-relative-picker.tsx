import type React from 'react'
import { useState } from 'react'
import { Label, Radio, RadioGroup } from 'react-aria-components'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { LinkRefusal } from '@arbor/core/relatives/existing-relative-link'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { listedPeople } from '@/features/family-pages/family-people'
import { PersonLine } from '@/features/family-pages/person-line'
import { personName } from '@/features/people/person-name'
import { today } from '@/infrastructure/clock'
import { SearchField } from '@/presentation/components/search-field'
import { useFilter } from '@/presentation/components/use-filter'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { linkRefusalKey } from './link-refusal-key'

import './existing-relative-picker.sass'

/** Under this many people the whole list fits a phone screen, and a search field is one more thing to understand. */
const SEARCH_FROM = 7

type ExistingRelativePickerProps = {
  /** The person the relative is tied to, left out of the list. */
  anchorId: EntityId
  chosenId: EntityId | null
  onChoose: (personId: EntityId) => void
  /** Why the family would refuse that person, or `null` when it would take them. */
  refusalOf: (personId: EntityId) => LinkRefusal | null
}

/** Everyone already in the tree, to tap the relative in; those the link cannot reach stay listed, greyed, with the reason. */
export const ExistingRelativePicker: React.FC<ExistingRelativePickerProps> = ({
  anchorId,
  chosenId,
  onChoose,
  refusalOf
}) => {
  const translate = useTranslate()
  const { family } = useOpenFamily()
  const { contains } = useFilter({ sensitivity: 'base' })
  const [query, setQuery] = useState('')

  const candidates = listedPeople(family.family, today()).filter(
    ({ person }) => person.id !== anchorId
  )
  const shown = candidates.filter(({ person }) =>
    contains(personName(person) ?? '', query.trim())
  )

  const choose = (chosen: string) => {
    const listed = candidates.find(({ person }) => person.id === chosen)
    if (listed !== undefined) onChoose(listed.person.id)
  }

  return (
    <div className='existing-relative-picker'>
      {candidates.length >= SEARCH_FROM ? (
        <SearchField
          clearLabel={translate('add.existing.search.clear')}
          label={translate('add.existing.search.label')}
          onChange={setQuery}
          placeholder={translate('add.existing.search.placeholder')}
          value={query}
        />
      ) : null}
      {shown.length === 0 ? (
        <p className='existing-relative-no-match' role='status'>
          {translate('add.existing.noMatch')}
        </p>
      ) : (
        <RadioGroup
          className='existing-relative-people'
          onChange={choose}
          value={chosenId}
        >
          <Label className='field-label'>
            {translate('add.existing.people')}
          </Label>
          {shown.map((listed) => {
            const refusal = refusalOf(listed.person.id)
            return (
              <Radio
                className='existing-relative-person'
                isDisabled={refusal !== null}
                key={listed.person.id}
                value={listed.person.id}
              >
                <span aria-hidden='true' className='existing-relative-mark' />
                <span className='existing-relative-who'>
                  <PersonLine isMe={false} listed={listed} />
                  {refusal === null ? null : (
                    <span className='existing-relative-refusal'>
                      {translate(linkRefusalKey(refusal))}
                    </span>
                  )}
                </span>
              </Radio>
            )
          })}
        </RadioGroup>
      )}
    </div>
  )
}
