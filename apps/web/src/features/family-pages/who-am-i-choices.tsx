import type React from 'react'
import { useState } from 'react'

import type { Author } from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'

import { personName } from '@/features/people/person-name'
import { today } from '@/infrastructure/clock'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { NextIcon, PersonIcon } from '@/presentation/components/icons'
import { SearchField } from '@/presentation/components/search-field'
import { TextField } from '@/presentation/components/text-field'
import { useFilter } from '@/presentation/components/use-filter'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { listedPeople } from './family-people'
import { PersonLine } from './person-line'

import './who-am-i-choices.sass'

/** Under this many people the whole list fits a phone screen, and a search field is one more thing to understand. */
const SEARCH_FROM = 7

type WhoAmIChoicesProps = {
  /** More ways out under "I am not in the tree", kept in reach at the bottom of a long list. */
  children?: React.ReactNode
  /** The person the visitor said they are last time, marked in the list. */
  myPersonId: EntityId | null
  /** The visitor's answer: their own person, or the name they sign with until they have a sticker. */
  onChoose: (me: Author) => void
}

/** The living people of the tree to tap one's own name in, and "I am not in the tree" to sign with a typed name instead. */
export const WhoAmIChoices: React.FC<WhoAmIChoicesProps> = ({
  children,
  myPersonId,
  onChoose
}) => {
  const translate = useTranslate()
  const { family } = useOpenFamily()
  const { contains } = useFilter({ sensitivity: 'base' })
  const [query, setQuery] = useState('')
  const [isNamingSelf, setIsNamingSelf] = useState(false)
  const [ownName, setOwnName] = useState('')

  const candidates = listedPeople(family.family, today()).filter(
    ({ isLiving }) => isLiving
  )
  const shown = candidates.filter(({ person }) =>
    contains(personName(person) ?? '', query.trim())
  )

  const chooseOwnName = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onChoose({ kind: 'named', name: ownName.trim() })
  }

  return (
    <div className='who-am-i-choices'>
      {candidates.length >= SEARCH_FROM ? (
        <SearchField
          clearLabel={translate('whoAmI.search.clear')}
          label={translate('whoAmI.search.label')}
          onChange={setQuery}
          placeholder={translate('whoAmI.search.placeholder')}
          value={query}
        />
      ) : null}
      {shown.length === 0 && query !== '' ? (
        <p className='who-am-i-no-match' role='status'>
          {translate('whoAmI.noMatch')}
        </p>
      ) : (
        <ul aria-label={translate('whoAmI.title')} className='who-am-i-people'>
          {shown.map((listed) => (
            <li key={listed.person.id}>
              <Button
                className='who-am-i-person'
                onPress={() =>
                  onChoose({ kind: 'person', personId: listed.person.id })
                }
                variant='quiet'
              >
                <PersonLine
                  isMe={listed.person.id === myPersonId}
                  listed={listed}
                />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className='who-am-i-others'>
        {isNamingSelf ? (
          <Form className='who-am-i-own-name' onSubmit={chooseOwnName}>
            <TextField
              autoComplete='name'
              autoFocus
              description={translate('whoAmI.notInTree.hint')}
              errorMessage={translate('whoAmI.notInTree.missing')}
              isRequired
              label={translate('whoAmI.notInTree.field')}
              name='ownName'
              onChange={setOwnName}
              value={ownName}
            />
            <Button isBlock type='submit'>
              {translate('whoAmI.notInTree.submit')}
              <NextIcon aria-hidden='true' />
            </Button>
          </Form>
        ) : (
          <Button isBlock onPress={() => setIsNamingSelf(true)} variant='ghost'>
            <PersonIcon aria-hidden='true' />
            {translate('whoAmI.notInTree.action')}
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
