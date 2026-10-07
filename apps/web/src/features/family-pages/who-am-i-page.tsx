import type React from 'react'
import { useId, useState } from 'react'

import {
  type FamilyAccess,
  ONLOOKER
} from '@/features/family-access/family-access'
import {
  rememberedMe,
  rememberMe
} from '@/features/family-access/remembered-families'
import { today } from '@/infrastructure/clock'
import {
  familyPathFor,
  Redirect,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { AlbumGlyph } from '@/presentation/components/album-glyph'
import { Button } from '@/presentation/components/button'
import { Form } from '@/presentation/components/form'
import { LookIcon, NextIcon, PersonIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { SearchField } from '@/presentation/components/search-field'
import { TextField } from '@/presentation/components/text-field'
import { useFilter } from '@/presentation/components/use-filter'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOpenFamily } from './family-loader'
import { listedPeople } from './family-people'
import { PersonLine } from './person-line'
import { personName } from './person-name'

import './who-am-i-page.sass'

/** Under this many people the whole list fits a phone screen, and a search field is one more thing to understand. */
const SEARCH_FROM = 7

/** "Who are you?": the visitor taps their own person, names themselves, or says they only look. Readers are never asked. */
export const WhoAmIPage: React.FC = () => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const { family, familyId } = useOpenFamily()
  const { contains } = useFilter({ sensitivity: 'base' })
  const [query, setQuery] = useState('')
  const [isNamingSelf, setIsNamingSelf] = useState(false)
  const [ownName, setOwnName] = useState('')
  const titleId = useId()

  if (family.role === 'reader') {
    return <Redirect to={familyPathFor(familyId)} />
  }

  const me = rememberedMe(familyId)
  const myPersonId =
    me !== null && me !== ONLOOKER && me.kind === 'person' ? me.personId : null
  const candidates = listedPeople(family.family, today()).filter(
    ({ isLiving }) => isLiving
  )
  const shown = candidates.filter(({ person }) =>
    contains(personName(person) ?? '', query.trim())
  )

  const choose = (chosen: NonNullable<FamilyAccess['me']>): void => {
    rememberMe(familyId, chosen)
    navigateTo(familyPathFor(familyId), { replace: true })
  }

  const chooseOwnName = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    choose({ kind: 'named', name: ownName.trim() })
  }

  const lookOnly = (): void => choose(ONLOOKER)

  return (
    <Main className='who-am-i-page'>
      <DocumentTitle>{`${translate('whoAmI.title')} — ${family.settings.name}`}</DocumentTitle>
      <div className='who-am-i-head'>
        <p className='who-am-i-family'>
          <AlbumGlyph />
          {family.settings.name}
        </p>
        <h1 className='who-am-i-title' id={titleId}>
          {translate('whoAmI.title')}
        </h1>
        <p className='who-am-i-intro'>{translate('whoAmI.intro')}</p>
        {candidates.length >= SEARCH_FROM ? (
          <SearchField
            clearLabel={translate('whoAmI.search.clear')}
            label={translate('whoAmI.search.label')}
            onChange={setQuery}
            placeholder={translate('whoAmI.search.placeholder')}
            value={query}
          />
        ) : null}
      </div>
      {shown.length === 0 && query !== '' ? (
        <p className='who-am-i-no-match' role='status'>
          {translate('whoAmI.noMatch')}
        </p>
      ) : (
        <ul aria-labelledby={titleId} className='who-am-i-choices'>
          {shown.map((listed) => (
            <li key={listed.person.id}>
              <Button
                className='who-am-i-choice'
                onPress={() =>
                  choose({ kind: 'person', personId: listed.person.id })
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
        <Button onPress={lookOnly} variant='link'>
          <LookIcon aria-hidden='true' />
          {translate('whoAmI.onlooker')}
        </Button>
      </div>
    </Main>
  )
}
