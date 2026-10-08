import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useId } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import type { FamilyState } from '@arbor/core/family/family-state'
import { familyWarnings } from '@arbor/core/family/family-warnings'

import type { PersonFace } from '@/features/family-tree/person-face'
import { generationClass } from '@/presentation/components/generation-class'
import { WarningIcon } from '@/presentation/components/icons'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useOccurrenceWords } from './occurrence-words'
import { type PersonWarning, warningsAbout } from './person-warnings'
import { SheetActions } from './sheet-actions'
import { SheetRelatives } from './sheet-relatives'

import './person-sheet.sass'

type PersonSheetProps = {
  face: PersonFace
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
  person: Person
}

/** Everything the family knows about one person, and everyone they are tied to. */
export const PersonSheet: React.FC<PersonSheetProps> = ({
  face,
  faces,
  family,
  person
}) => {
  const translate = useTranslate()
  const occurrence = useOccurrenceWords()
  const headingId = useId()
  const nameOf = (personId: EntityId): string =>
    faces.get(personId)?.name ?? translate('common.unnamedPerson')
  const warningText = (warning: PersonWarning): string => {
    switch (warning.kind) {
      case 'born_before_parent':
        return translate('sheet.warning.bornBeforeParent', {
          name: nameOf(warning.parentId)
        })
      case 'born_after_child':
        return translate('sheet.warning.bornAfterChild', {
          name: nameOf(warning.childId)
        })
      case 'death_before_birth':
        return translate('sheet.warning.deathBeforeBirth')
      default:
        return warning satisfies never
    }
  }
  const warnings = warningsAbout(familyWarnings(family), person.id)
  const birth = person.birth === null ? null : occurrence.fact(person.birth)
  const death =
    person.death === null
      ? null
      : (occurrence.fact(person.death) ?? translate('sheet.deathUnknown'))
  const hasBirthSurname =
    person.birthSurname !== null &&
    person.birthSurname !== '' &&
    person.birthSurname !== person.surname
  const isNameless = face.givenNames === '' && face.surname === ''

  return (
    <section aria-labelledby={headingId} className='person-sheet'>
      <header
        className={classNames('sheet-hero', generationClass(face.generation))}
      >
        <Sticker
          generation={face.generation}
          givenNames={face.givenNames}
          isDeceased={face.isDeceased}
          lifeYears={face.years}
          monogram={face.monogram}
          slotNumber={face.slotNumber}
          surname={face.surname}
        />
        <div className='sheet-identity'>
          <h2 className='sheet-name' id={headingId}>
            {face.givenNames === '' ? null : (
              <span className='sheet-given-names'>{face.givenNames}</span>
            )}
            <span className='sheet-surname'>
              {isNameless ? face.name : face.surname}
            </span>
          </h2>
          <p className='sheet-life'>
            {face.years === '' ? null : (
              <span className='sheet-years'>{face.years}</span>
            )}
            <span className='sheet-generation'>
              {translate('sheet.generation', { number: face.generation })}
            </span>
          </p>
        </div>
      </header>
      {warnings.length === 0 ? null : (
        <ul className='sheet-warnings'>
          {warnings.map((warning) => (
            <li className='sheet-warning' key={JSON.stringify(warning)}>
              <WarningIcon aria-hidden='true' className='sheet-warning-icon' />
              <span>
                <b>{translate('sheet.warning.title')}</b> {warningText(warning)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {birth === null && death === null && !hasBirthSurname ? null : (
        <dl className='sheet-facts'>
          {birth === null ? null : (
            <div>
              <dt>{translate('sheet.birth')}</dt>
              <dd>{birth}</dd>
            </div>
          )}
          {hasBirthSurname ? (
            <div>
              <dt>{translate('sheet.birthSurname')}</dt>
              <dd>{person.birthSurname}</dd>
            </div>
          ) : null}
          {death === null ? null : (
            <div>
              <dt>{translate('sheet.death')}</dt>
              <dd>{death}</dd>
            </div>
          )}
        </dl>
      )}
      {person.notes === '' ? null : (
        <div className='sheet-group'>
          <h3 className='sheet-group-title'>{translate('sheet.notes')}</h3>
          <p className='sheet-notes'>{person.notes}</p>
        </div>
      )}
      <SheetActions face={face} person={person} />
      <SheetRelatives face={face} faces={faces} family={family} />
    </section>
  )
}
