import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { today } from '@/infrastructure/clock'
import {
  familyBinPathFor,
  familyHistoryPathFor,
  familySharePathFor,
  familyTreePathFor,
  Redirect,
  whoAmIPathFor
} from '@/infrastructure/router/navigation'
import { ButtonLink } from '@/presentation/components/button-link'
import { generationClass } from '@/presentation/components/generation-class'
import {
  BinIcon,
  HistoryIcon,
  ShareIcon,
  TreeIcon
} from '@/presentation/components/icons'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { FamilyAppBar } from './family-app-bar'
import { useOpenFamily } from './family-loader'
import { groupedByGeneration, listedPeople } from './family-people'
import { MeSummary } from './me-summary'
import { PersonLine } from './person-line'

import './family-home-page.sass'

/** The family's album, one band per generation; a first visit asks "Who are you?" before anything else. */
export const FamilyHomePage: React.FC = () => {
  const translate = useTranslate()
  const { family, familyId } = useOpenFamily()
  const me = rememberedMe(familyId)

  if (me === null && family.role !== 'reader') {
    return <Redirect to={whoAmIPathFor(familyId)} />
  }

  const people = listedPeople(family.family, today())
  const myPersonId =
    me !== null && me !== ONLOOKER && me.kind === 'person' ? me.personId : null

  return (
    <>
      <FamilyAppBar />
      <Main className='family-home-page'>
        <DocumentTitle>{`${family.settings.name} — ${translate('app.name')}`}</DocumentTitle>
        <div className='family-home-head'>
          <h1 className='family-home-title'>{family.settings.name}</h1>
          <p className='family-home-count'>
            {translate('familyHome.people', { count: people.length })}
          </p>
          <MeSummary />
          <ButtonLink href={familyTreePathFor(familyId)}>
            <TreeIcon aria-hidden='true' />
            {translate('familyHome.openTree')}
          </ButtonLink>
          {family.role === 'reader' ? null : (
            <>
              <ButtonLink href={familySharePathFor(familyId)} variant='ghost'>
                <ShareIcon aria-hidden='true' />
                {translate('familyHome.share')}
              </ButtonLink>
              <div className='family-home-links'>
                <ButtonLink
                  href={familyHistoryPathFor({ familyId })}
                  variant='link'
                >
                  <HistoryIcon aria-hidden='true' />
                  {translate('familyHome.history')}
                </ButtonLink>
                <ButtonLink href={familyBinPathFor(familyId)} variant='link'>
                  <BinIcon aria-hidden='true' />
                  {translate('familyHome.bin')}
                </ButtonLink>
              </div>
            </>
          )}
        </div>
        {people.length === 0 ? (
          <p className='family-home-empty'>{translate('familyHome.empty')}</p>
        ) : (
          groupedByGeneration(people).map(({ generation, people: members }) => (
            <section
              className={classNames(
                'generation-band',
                generationClass(generation)
              )}
              key={generation}
            >
              <h2 className='generation-band-head'>
                {translate('familyHome.generation', { number: generation })}
                <span className='generation-band-count'>
                  {translate('familyHome.people', { count: members.length })}
                </span>
              </h2>
              <ul className='generation-band-people'>
                {members.map((listed) => (
                  <li key={listed.person.id}>
                    <PersonLine
                      isMe={listed.person.id === myPersonId}
                      listed={listed}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </Main>
    </>
  )
}
