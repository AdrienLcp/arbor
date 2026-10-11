import type React from 'react'
import { useState } from 'react'

import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { Form } from '@/presentation/components/form'
import { AddIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { Radio, RadioGroup } from '@/presentation/components/radio-group'
import { TextField } from '@/presentation/components/text-field'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { SiteHeader } from '@/presentation/site-header'

import { FounderPreview } from './founder-preview'
import { useCreateFamily } from './use-create-family'

import './create-family-page.sass'

type StartsWith = 'me' | 'someoneElse'

const isStartsWith = (value: string): value is StartsWith =>
  value === 'me' || value === 'someoneElse'

/** The creator names the tree's first person, themselves or someone else, and the tree; the tree's name follows that person's surname until they write their own. */
export const CreateFamilyPage: React.FC = () => {
  const translate = useTranslate()
  const { create, hasFailed, isPending } = useCreateFamily()
  const [startsWith, setStartsWith] = useState<StartsWith>('me')
  const [givenNames, setGivenNames] = useState('')
  const [surname, setSurname] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [ownTreeName, setOwnTreeName] = useState<string | null>(null)

  const suggestedTreeName =
    surname.trim() === ''
      ? ''
      : translate('createFamily.treeNameSuggestion', {
          surname: surname.trim()
        })
  const treeName = ownTreeName ?? suggestedTreeName

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    create({
      creator:
        startsWith === 'me'
          ? { kind: 'founder' }
          : { kind: 'named', name: creatorName.trim() },
      founder: { givenNames: givenNames.trim(), surname: surname.trim() },
      treeName: treeName.trim()
    })
  }

  return (
    <>
      <SiteHeader />
      <Main className='create-family-page'>
        <DocumentTitle>{`${translate('createFamily.title')} — ${translate('app.name')}`}</DocumentTitle>
        <div className='create-family-head'>
          <h1 className='create-family-title'>
            {translate('createFamily.title')}
          </h1>
          <p className='create-family-intro'>
            {translate('createFamily.intro')}
          </p>
        </div>
        <FounderPreview
          givenNames={givenNames}
          isCreator={startsWith === 'me'}
          surname={surname}
        />
        <Form className='create-family-form' onSubmit={submit}>
          <RadioGroup
            label={translate('createFamily.startsWith.label')}
            onChange={(value) => {
              if (isStartsWith(value)) setStartsWith(value)
            }}
            value={startsWith}
          >
            <Radio value='me'>{translate('createFamily.startsWith.me')}</Radio>
            <Radio value='someoneElse'>
              {translate('createFamily.startsWith.someoneElse')}
            </Radio>
          </RadioGroup>
          <TextField
            autoComplete={startsWith === 'me' ? 'given-name' : 'off'}
            errorMessage={translate(
              `createFamily.${startsWith}.givenNamesMissing`
            )}
            isRequired
            label={translate(`createFamily.${startsWith}.givenNames`)}
            name='givenNames'
            onChange={setGivenNames}
            value={givenNames}
          />
          <TextField
            autoComplete={startsWith === 'me' ? 'family-name' : 'off'}
            description={translate(`createFamily.${startsWith}.surnameHint`)}
            label={translate(`createFamily.${startsWith}.surname`)}
            name='surname'
            onChange={setSurname}
            value={surname}
          />
          {startsWith === 'someoneElse' ? (
            <TextField
              autoComplete='name'
              description={translate('createFamily.creatorName.hint')}
              errorMessage={translate('createFamily.creatorName.missing')}
              isRequired
              label={translate('createFamily.creatorName.field')}
              name='creatorName'
              onChange={setCreatorName}
              value={creatorName}
            />
          ) : null}
          <TextField
            description={translate('createFamily.treeNameHint')}
            errorMessage={translate('createFamily.treeNameMissing')}
            isRequired
            label={translate('createFamily.treeName')}
            name='treeName'
            onChange={setOwnTreeName}
            value={treeName}
          />
          {hasFailed ? (
            <FailureNotice>{translate('common.failed')}</FailureNotice>
          ) : null}
          <Button isBlock isPending={isPending} type='submit'>
            <AddIcon aria-hidden='true' />
            {translate('createFamily.submit')}
          </Button>
        </Form>
      </Main>
    </>
  )
}
