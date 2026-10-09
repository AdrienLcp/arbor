import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from './generation-class'
import { slotNumberText } from './slot-number'

import './slot.sass'

type StickerProps = {
  className?: string
  /** Counted from the oldest generation, 1 first: it picks the sticker's ink. */
  generation: number
  givenNames: string
  /** A deceased person's sticker is matte, its art dulled, a rule over its caption (The Matte Means Gone Rule). */
  isDeceased?: boolean
  /** The years printed under the name: "1932 – † 2019"; left out when none is known. */
  lifeYears?: string
  /** The initials drawn on the art. */
  monogram: string
  /** A picture laid over the monogram: the person's portrait, when they have one. */
  portrait?: React.ReactNode
  /** The number printed above the slot. */
  slotNumber: number
  /** Hands the slot its size, `--slot-width` and `--slot-height`. */
  style?: React.CSSProperties
  surname: string
}

/**
 * A person pressed into their numbered slot: the album's sticker, at full size. Phrasing content only, so a button may hold it.
 * Its words are spaced in the markup, where the layout drops the spaces: a name read from the content must not run "02MarieMorel".
 */
export const Sticker: React.FC<StickerProps> = ({
  className,
  generation,
  givenNames,
  isDeceased = false,
  lifeYears,
  monogram,
  portrait,
  slotNumber,
  style,
  surname
}) => (
  <span
    className={classNames('slot', generationClass(generation), className)}
    style={style}
  >
    <span className='slot-number'>{slotNumberText(slotNumber)}</span>{' '}
    <span className='slot-bed'>
      <span className={classNames('sticker', isDeceased && 'deceased')}>
        <span aria-hidden='true' className='sticker-art'>
          {monogram}
          {portrait}
        </span>{' '}
        <span className='sticker-caption'>
          <span className='sticker-given-names'>{givenNames}</span>{' '}
          <span className='sticker-surname'>{surname}</span>
          {lifeYears ? (
            <>
              {' '}
              <span className='sticker-years'>{lifeYears}</span>
            </>
          ) : null}
        </span>
      </span>
    </span>
  </span>
)
