import type React from 'react'
import { useState } from 'react'

import { Button } from '@/presentation/components/button'
import { FailureNotice } from '@/presentation/components/failure-notice'
import { Form } from '@/presentation/components/form'
import { AddIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { TextField } from '@/presentation/components/text-field'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { SiteHeader } from '@/presentation/site-header'

import { FounderPreview } from './founder-preview'
import { useCreateFamily } from './use-create-family'

import './create-family-page.sass'

/** The creator names themselves and the tree; the tree's name follows their surname until they write their own. */
export const CreateFamilyPage: React.FC = () => {
  const translate = useTranslate()
  const { create, hasFailed, isPending } = useCreateFamily()
  const [givenNames, setGivenNames] = useState('')
  const [surname, setSurname] = useState('')
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
        <FounderPreview givenNames={givenNames} surname={surname} />
        <Form className='create-family-form' onSubmit={submit}>
          <TextField
            autoComplete='given-name'
            errorMessage={translate('createFamily.givenNamesMissing')}
            isRequired
            label={translate('createFamily.givenNames')}
            name='givenNames'
            onChange={setGivenNames}
            value={givenNames}
          />
          <TextField
            autoComplete='family-name'
            description={translate('createFamily.surnameHint')}
            label={translate('createFamily.surname')}
            name='surname'
            onChange={setSurname}
            value={surname}
          />
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
