import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { useId, ViewTransition } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Union } from '@arbor/protocol/union'

import { PortraitImage } from '@/features/photos/portrait-image'
import { GhostSlot } from '@/presentation/components/ghost-slot'
import { SlotButton } from '@/presentation/components/slot-button'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { useKinWords } from './kin-words'
import { unionLineStyle } from './line-style'
import { LineSwatch } from './line-swatch'
import type { PersonFace } from './person-face'
import { RelativeButton } from './relative-button'
import { useUnionWords } from './union-words'

import './focus-couples.sass'

/** A second partner would squeeze three stickers into a phone's width, under the 16px floor: the focus then stands alone and the partners are listed under it. */
const MOST_PARTNERS_IN_A_ROW = 1

export type FocusCouple = {
  partner: PersonFace | null
  union: Union | null
}

type FocusCouplesProps = {
  couples: readonly FocusCouple[]
  focus: PersonFace
  onPressPerson: (personId: EntityId) => void
}

const FocusSticker: React.FC<{ focus: PersonFace }> = ({ focus }) => (
  <ViewTransition name={`person-${focus.id}`}>
    <Sticker
      className='focus focus-couples-self'
      generation={focus.generation}
      givenNames={focus.givenNames}
      isDeceased={focus.isDeceased}
      lifeYears={focus.years}
      monogram={focus.monogram}
      portrait={<PortraitImage photoId={focus.portraitPhotoId} />}
      slotNumber={focus.slotNumber}
      surname={focus.surname}
    />
  </ViewTransition>
)

const CoupleTie: React.FC<{ union: Union | null }> = ({ union }) => (
  <span className='focus-couples-tie'>
    <LineSwatch
      height={14}
      isEnded={union?.end != null}
      style={unionLineStyle(union)}
      width={18}
    />
  </span>
)

/** The middle of a phone page: the focus person's foil sticker, between the partners of their unions. */
export const FocusCouples: React.FC<FocusCouplesProps> = ({
  couples,
  focus,
  onPressPerson
}) => {
  const translate = useTranslate()
  const tagIdPrefix = useId()
  const kin = useKinWords()
  const unionWords = useUnionWords()
  const wordsOf = ({ partner, union }: FocusCouple): string[] => [
    partner === null
      ? translate('tree.spread.unknownPartner.hint')
      : kin.partner(partner, union),
    ...(union === null ? [] : [unionWords(union).join(', ')])
  ]

  const keyOf = ({ partner, union }: FocusCouple): string =>
    `${union?.id ?? 'no-union'}-${partner?.id ?? 'unknown'}`
  const tagIdOf = (couple: FocusCouple): string =>
    `${tagIdPrefix}-${keyOf(couple)}`

  if (couples.length > MOST_PARTNERS_IN_A_ROW) {
    return (
      <div className='focus-couples alone'>
        <FocusSticker focus={focus} key={focus.id} />
        <ul className='focus-couples-list'>
          {couples.map((couple) =>
            couple.partner === null ? null : (
              <li key={couple.union?.id ?? couple.partner.id}>
                <RelativeButton
                  face={couple.partner}
                  lines={wordsOf(couple)}
                  onPress={() => {
                    if (couple.partner !== null)
                      onPressPerson(couple.partner.id)
                  }}
                  swatch={unionLineStyle(couple.union)}
                />
              </li>
            )
          )}
        </ul>
      </div>
    )
  }

  const partnerColumn = (couple: FocusCouple) => {
    const partner = couple.partner

    return (
      <div className='focus-couples-partner' key={keyOf(couple)}>
        {partner === null ? (
          <GhostSlot
            className='unnumbered'
            generation={focus.generation}
            hint={translate('tree.spread.unknownPartner.hint')}
            slotNumber={0}
            title={translate('tree.spread.unknownPartner.title')}
          />
        ) : (
          <SlotButton
            aria-describedby={tagIdOf(couple)}
            aria-label={
              partner.givenNames === '' && partner.surname === ''
                ? [partner.name, partner.years]
                    .filter((words) => words !== '')
                    .join(', ')
                : undefined
            }
            onPress={() => onPressPerson(partner.id)}
          >
            <ViewTransition name={`person-${partner.id}`}>
              <Sticker
                generation={partner.generation}
                givenNames={partner.givenNames}
                isDeceased={partner.isDeceased}
                lifeYears={partner.years}
                monogram={partner.monogram}
                portrait={<PortraitImage photoId={partner.portraitPhotoId} />}
                slotNumber={partner.slotNumber}
                surname={partner.surname}
              />
            </ViewTransition>
          </SlotButton>
        )}
      </div>
    )
  }

  const tagOf = (couple: FocusCouple) => {
    const [word, ...when] = wordsOf(couple)

    return (
      <span
        aria-hidden='true'
        className='focus-couples-tag'
        id={tagIdOf(couple)}
      >
        {word}
        {when.map((line) => (
          <span className='focus-couples-when' key={line}>
            {line}
          </span>
        ))}
      </span>
    )
  }

  const [couple] = couples

  return (
    <div
      className={classNames('focus-couples', couple === undefined && 'alone')}
    >
      <div className='focus-couples-row'>
        <FocusSticker focus={focus} key={focus.id} />
        {couple === undefined ? null : (
          <>
            <CoupleTie union={couple.union} />
            {partnerColumn(couple)}
          </>
        )}
      </div>
      {couple === undefined ? null : (
        <div className='focus-couples-tags'>{tagOf(couple)}</div>
      )}
    </div>
  )
}
