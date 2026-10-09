import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { describeKinship } from '@arbor/core/kinship/describe-kinship'
import { kinStepsAlong } from '@arbor/core/kinship/kin-steps'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { personIdOfMe } from '@/features/family-access/family-access'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { useWhoAmI } from '@/features/family-pages/who-am-i-provider'
import type { PersonFace } from '@/features/family-tree/person-face'
import { PersonSearch } from '@/features/family-tree/person-search'
import { isInTree } from '@/features/family-tree/tree-view'
import {
  kinshipTreePathFor,
  personSheetPathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/button'
import { ButtonLink } from '@/presentation/components/button-link'
import { PHONE_SCREEN } from '@/presentation/components/phone-screen'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { useLocale, useTranslate } from '@/presentation/i18n/i18n-context'

import { familyKinship, kinPathOf } from './family-kinship'
import { kinChartOf } from './kin-chart'
import { KinChartView } from './kin-chart-view'

import './sheet-kinship.sass'

/** How a person is called in a sentence about them: their given names, or their full name when they have none. */
const calledName = (face: PersonFace): string => face.givenNames || face.name

type SheetKinshipProps = {
  face: PersonFace
  faces: ReadonlyMap<EntityId, PersonFace>
  family: FamilyState
}

/**
 * How the sheet's person is related to the visitor, said in one sentence and
 * drawn as a small tree; the visitor may compare them with anyone else.
 * Key it by the sheet's person, so a new sheet starts from the visitor again.
 */
export const SheetKinship: React.FC<SheetKinshipProps> = ({
  face,
  faces,
  family
}) => {
  const translate = useTranslate()
  const locale = useLocale()
  const navigateTo = useNavigateTo()
  const isPhone = useMediaQuery(PHONE_SCREEN)
  const { familyId } = useOpenFamily()
  const [comparedId, setComparedId] = useState<EntityId | null>(null)

  const { me } = useWhoAmI()
  const myId = personIdOfMe(me)
  const youId = myId !== null && isInTree(family, myId) ? myId : null
  const ownId = youId === face.id ? null : youId
  const personId = comparedId ?? ownId
  const others = [...faces.values()].filter(
    ({ id }) => id !== face.id && isInTree(family, id)
  )

  const pickLabel = (): string => {
    if (personId !== null) return translate('kinship.compareLabel')
    return youId === face.id
      ? translate('kinship.pickLabelForYou')
      : translate('kinship.pickLabel', { name: calledName(face) })
  }

  const answer = () => {
    if (personId === null) return null
    const kinship = familyKinship(family, { personId, relativeId: face.id })
    const person = faces.get(personId)
    const sentence = describeKinship(kinship, {
      locale,
      person:
        personId === youId
          ? 'you'
          : { name: person === undefined ? '' : calledName(person) },
      relative: face.id === youId ? 'you' : { name: calledName(face) }
    })
    const path = kinPathOf(kinship)

    return (
      <>
        <p className='kinship-sentence'>{sentence}</p>
        {path === null ? null : (
          <KinChartView
            chart={kinChartOf({
              path,
              steps: kinStepsAlong(familyLineage(family), path)
            })}
            faces={faces}
            label={translate('kinship.chart', {
              from:
                personId === youId
                  ? translate('kinship.you')
                  : (person?.name ?? ''),
              to: face.name
            })}
            onPressPerson={(pressedId) =>
              navigateTo(personSheetPathFor({ familyId, personId: pressedId }))
            }
            youId={youId}
          />
        )}
        {path === null || isPhone ? null : (
          <ButtonLink
            href={kinshipTreePathFor({
              familyId,
              personId,
              relativeId: face.id
            })}
            variant='ghost'
          >
            {translate('kinship.showInTree')}
          </ButtonLink>
        )}
      </>
    )
  }

  return (
    <div className='sheet-group sheet-kinship'>
      <h3 className='sheet-group-title'>{translate('kinship.title')}</h3>
      {answer()}
      <div className='kinship-compare'>
        <PersonSearch
          label={pickLabel()}
          onPick={setComparedId}
          people={others}
        />
        {comparedId === null || ownId === null ? null : (
          <Button onPress={() => setComparedId(null)} variant='link'>
            {translate('kinship.backToMe')}
          </Button>
        )}
      </div>
    </div>
  )
}
