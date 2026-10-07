import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from './generation-class'
import { slotNumberText } from './slot-number'

import './slot.sass'

type GhostSlotProps = {
  className?: string
  /** Counted from the oldest generation, 1 first: it colours the slot's number. */
  generation: number
  /** Who belongs here: "the eldest you know of". */
  hint: string
  /** The number printed above the slot. */
  slotNumber: number
  /** The word printed in the empty outline: "Stick here". */
  title: string
}

/** An empty numbered slot, printed in outline: a person still to add. */
export const GhostSlot: React.FC<GhostSlotProps> = ({
  className,
  generation,
  hint,
  slotNumber,
  title
}) => (
  <div className={classNames('slot', generationClass(generation), className)}>
    <span className='slot-number'>{slotNumberText(slotNumber)}</span>
    <div className='slot-bed'>
      <div className='ghost-slot'>
        <span className='ghost-slot-title'>{title}</span>
        <span className='ghost-slot-hint'>{hint}</span>
      </div>
    </div>
  </div>
)
