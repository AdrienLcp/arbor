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
  /** The initials drawn on the art. */
  monogram: string
  /** The number printed above the slot. */
  slotNumber: number
  surname: string
}

/** A person pressed into their numbered slot: the album's sticker, at full size. */
export const Sticker: React.FC<StickerProps> = ({
  className,
  generation,
  givenNames,
  monogram,
  slotNumber,
  surname
}) => (
  <div className={classNames('slot', generationClass(generation), className)}>
    <span className='slot-number'>{slotNumberText(slotNumber)}</span>
    <div className='slot-bed'>
      <div className='sticker'>
        <span aria-hidden='true' className='sticker-art'>
          {monogram}
        </span>
        <span className='sticker-caption'>
          <span className='sticker-given-names'>{givenNames}</span>
          <span className='sticker-surname'>{surname}</span>
        </span>
      </div>
    </div>
  </div>
)
