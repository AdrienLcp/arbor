import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { ViewTransition } from 'react'

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

/** Beyond two partners the row would not fit a phone: the focus stands alone and the partners are listed under it. */
const MOST_PARTNERS_IN_A_ROW = 2

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
  const kin = useKinWords()
  const unionWords = useUnionWords()
  const wordsOf = ({ partner, union }: FocusCouple): string[] => [
    partner === null
      ? translate('tree.spread.unknownPartner.hint')
      : kin.partner(partner, union),
    ...(union === null ? [] : [unionWords(union).join(', ')])
  ]

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
      <div
        className='focus-couples-partner'
        key={`${couple.union?.id ?? 'no-union'}-${partner?.id ?? 'unknown'}`}
      >
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
            aria-label={`${partner.name}, ${wordsOf(couple).join(', ')}`}
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

  const tagOf = (couple: FocusCouple, side: 'end' | 'start') => {
    const [word, ...when] = wordsOf(couple)

    return (
      <span
        aria-hidden='true'
        className={classNames('focus-couples-tag', side)}
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

  const [first, second] = couples
  const left = second === undefined ? null : (first ?? null)
  const right = second ?? first ?? null

  return (
    <div className={classNames('focus-couples', right === null && 'alone')}>
      <div className='focus-couples-row'>
        {left === null ? null : (
          <>
            {partnerColumn(left)}
            <CoupleTie union={left.union} />
          </>
        )}
        <FocusSticker focus={focus} key={focus.id} />
        {right === null ? null : (
          <>
            <CoupleTie union={right.union} />
            {partnerColumn(right)}
          </>
        )}
      </div>
      {right === null ? null : (
        <div className='focus-couples-tags'>
          {left === null ? null : tagOf(left, 'start')}
          {tagOf(right, 'end')}
        </div>
      )}
    </div>
  )
}
