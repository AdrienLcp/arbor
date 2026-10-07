import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { ComboBox, ComboBoxItem } from '@/presentation/components/combo-box'
import { MiniSticker } from '@/presentation/components/mini-sticker'
import { useFilter } from '@/presentation/components/use-filter'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './person-search.sass'

/** Someone the search can find: what their suggestion shows. */
export type SearchablePerson = {
  generation: number
  id: EntityId
  isDeceased: boolean
  monogram: string
  name: string
  years: string
}

type PersonSearchProps = {
  onPick: (personId: EntityId) => void
  people: readonly SearchablePerson[]
}

/** Finds someone by name, accents or not, and turns the tree around them. */
export const PersonSearch: React.FC<PersonSearchProps> = ({
  onPick,
  people
}) => {
  const translate = useTranslate()
  const { contains } = useFilter({ sensitivity: 'base' })
  const [query, setQuery] = useState('')
  const isTyping = query.trim() !== ''
  const matches = isTyping
    ? people.filter((person) => contains(person.name, query))
    : []

  const pick = (key: React.Key | null) => {
    const picked = people.find((person) => person.id === key)
    if (picked === undefined) return
    setQuery('')
    onPick(picked.id)
  }

  return (
    <ComboBox
      allowsEmptyCollection={isTyping}
      className='person-search'
      emptyText={translate('tree.search.empty')}
      inputValue={query}
      items={matches}
      label={translate('tree.search.label')}
      menuTrigger='input'
      onInputChange={setQuery}
      onSelectionChange={pick}
      placeholder={translate('tree.search.placeholder')}
      selectedKey={null}
    >
      {(person) => (
        <ComboBoxItem id={person.id} textValue={person.name}>
          <MiniSticker
            generation={person.generation}
            isDeceased={person.isDeceased}
            monogram={person.monogram}
          />
          <span className='person-search-text'>
            <span className='person-search-name'>{person.name}</span>
            {person.years === '' ? null : (
              <span className='person-search-years'>{person.years}</span>
            )}
          </span>
        </ComboBoxItem>
      )}
    </ComboBox>
  )
}
