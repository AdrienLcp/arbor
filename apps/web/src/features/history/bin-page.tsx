import type React from 'react'
import { useId, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'

import { EditFailureNotice } from '@/features/family-edits/edit-failure-notice'
import { useAuthorName } from '@/features/family-edits/use-author-name'
import { useFamilyEdit } from '@/features/family-edits/use-family-edit'
import { WhoFirstNotice } from '@/features/family-edits/who-first-notice'
import { FamilyAppBar } from '@/features/family-pages/family-app-bar'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { binnedPeople } from '@/features/family-pages/family-people'
import { PersonLine } from '@/features/family-pages/person-line'
import { personName } from '@/features/people/person-name'
import { binConsequences } from '@/features/person-sheet/bin-consequences'
import { lastBinning } from '@/features/person-sheet/who-binned'
import { today } from '@/infrastructure/clock'
import {
  familyHistoryPathFor,
  familyPathFor,
  personSheetPathFor,
  Redirect
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { HistoryIcon, UnbinIcon } from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'
import { useWordList } from '@/presentation/i18n/word-list'

import { useChangeLog } from './use-change-log'
import { useEntryClock } from './use-entry-clock'

import './bin-page.sass'

type Restored = { name: string; personId: EntityId }

/** The people put in the bin, who put them there and when, what comes back with them; anyone takes one out. */
export const BinPage: React.FC = () => {
  const translate = useTranslate()
  const wordList = useWordList()
  const titleId = useId()
  const { family: response, familyId } = useOpenFamily()
  const isReader = response.role === 'reader'
  const { log } = useChangeLog({ isWanted: !isReader })
  const clock = useEntryClock()
  const authorName = useAuthorName()
  const edit = useFamilyEdit()
  const [restoring, setRestoring] = useState<EntityId | null>(null)
  const [restored, setRestored] = useState<Restored | null>(null)

  if (isReader) return <Redirect to={familyPathFor(familyId)} />

  const family = familyStateOfSnapshot(response.family)
  const people = binnedPeople(response.family, today())
  const nameOf = (id: EntityId): string => {
    const person = family.persons.get(id)
    return (
      (person === undefined ? null : personName(person)) ??
      translate('common.unnamedPerson')
    )
  }
  const comesBackWith = (personId: EntityId): string[] => {
    const { childIds, parentIds, partnerIds, photoCount } = binConsequences(
      family,
      personId
    )
    const names = (ids: readonly EntityId[]) => wordList(ids.map(nameOf))
    return [
      ...(partnerIds.length === 0
        ? []
        : [translate('bin.partners', { names: names(partnerIds) })]),
      ...(parentIds.length === 0
        ? []
        : [translate('bin.parents', { names: names(parentIds) })]),
      ...(childIds.length === 0
        ? []
        : [translate('bin.children', { names: names(childIds) })]),
      ...(photoCount === 0
        ? []
        : [translate('bin.photos', { count: photoCount })])
    ]
  }
  const binnedBy = (personId: EntityId): string | null => {
    if (log.status !== 'loaded') return null
    const binning = lastBinning(log.entries, personId)
    return binning === null
      ? null
      : translate('binPage.binnedBy', {
          moment: clock.momentOf(binning.at),
          name: authorName(binning.author)
        })
  }
  const takeOut = (personId: EntityId) => {
    setRestoring(personId)
    setRestored(null)
    edit.save([{ personId, type: 'person.restore' }], () => {
      setRestoring(null)
      setRestored({ name: nameOf(personId), personId })
    })
  }

  return (
    <>
      <FamilyAppBar />
      <Main aria-labelledby={titleId} className='bin-page'>
        <DocumentTitle>{`${translate('binPage.title')} — ${response.settings.name}`}</DocumentTitle>
        <div className='bin-head'>
          <h1 className='bin-title' id={titleId}>
            {translate('binPage.title')}
          </h1>
          <p className='bin-intro'>{translate('binPage.intro')}</p>
          <ButtonLink href={familyHistoryPathFor({ familyId })} variant='link'>
            <HistoryIcon aria-hidden='true' />
            {translate('familyBar.history')}
          </ButtonLink>
          {edit.author === null && people.length > 0 ? (
            <WhoFirstNotice />
          ) : null}
        </div>
        <div className='bin-news' role='status'>
          {restored === null ? null : (
            <>
              <p>{translate('binPage.restored', { name: restored.name })}</p>
              <ButtonLink
                href={personSheetPathFor({
                  familyId,
                  personId: restored.personId
                })}
                variant='link'
              >
                {translate('sheet.openShort')}
              </ButtonLink>
            </>
          )}
        </div>
        {people.length === 0 ? (
          <p className='bin-empty'>{translate('binPage.empty')}</p>
        ) : (
          <ul className='bin-people'>
            {people.map((listed) => {
              const { id } = listed.person
              const when = binnedBy(id)
              const links = comesBackWith(id)
              return (
                <li className='bin-person' key={id}>
                  <PersonLine isMe={false} listed={listed} />
                  {when === null ? null : (
                    <p className='bin-person-when'>{when}</p>
                  )}
                  {links.length === 0 ? null : (
                    <div className='bin-person-links'>
                      <p>{translate('binPage.comesBack')}</p>
                      <ul>
                        {links.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {edit.author === null ? null : (
                    <Button
                      isDisabled={edit.isPending && restoring !== id}
                      isPending={edit.isPending && restoring === id}
                      onPress={() => takeOut(id)}
                      variant='ghost'
                    >
                      <UnbinIcon aria-hidden='true' />
                      {translate('binPage.restore')}
                    </Button>
                  )}
                  {restoring === id && edit.failure !== null ? (
                    <EditFailureNotice failure={edit.failure} />
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </Main>
    </>
  )
}
