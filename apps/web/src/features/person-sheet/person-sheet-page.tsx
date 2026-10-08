import type React from 'react'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { usePersonFaces } from '@/features/family-pages/use-person-faces'
import {
  familyTreePathFor,
  useGoBack,
  useSheetPersonId
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { PreviousIcon } from '@/presentation/components/icons'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { PersonSheet } from './person-sheet'

import './person-sheet-page.sass'

/** A person's sheet, over the tree: on a phone it is the page, on a computer it slides in beside the album. */
export const PersonSheetPage: React.FC = () => {
  const translate = useTranslate()
  const { family: response, familyId } = useOpenFamily()
  const personId = useSheetPersonId()
  const faces = usePersonFaces()
  const goBack = useGoBack(familyTreePathFor(familyId))
  const family = familyStateOfSnapshot(response.family)
  const person = personId === null ? undefined : family.persons.get(personId)
  const face = personId === null ? undefined : faces.get(personId)

  return (
    <article className='person-sheet-page'>
      <div className='sheet-top'>
        <Button onPress={goBack} variant='quiet'>
          <PreviousIcon aria-hidden='true' />
          {translate('sheet.back')}
        </Button>
      </div>
      {person === undefined || face === undefined ? (
        <div className='sheet-missing'>
          <DocumentTitle>{`${translate('sheet.missing.title')} — ${response.settings.name}`}</DocumentTitle>
          <h2 className='sheet-missing-title'>
            {translate('sheet.missing.title')}
          </h2>
          <p>{translate('sheet.missing.body')}</p>
        </div>
      ) : (
        <>
          <DocumentTitle>{`${translate('sheet.title', { name: face.name })} — ${response.settings.name}`}</DocumentTitle>
          <PersonSheet
            face={face}
            faces={faces}
            family={family}
            person={person}
          />
        </>
      )}
    </article>
  )
}
