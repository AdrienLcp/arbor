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
  /** Hands the slot its size, `--slot-width` and `--slot-height`. */
  style?: React.CSSProperties
  /** The word printed in the empty outline: "Stick here". */
  title: string
}

/** An empty numbered slot, printed in outline: a person still to add. */
export const GhostSlot: React.FC<GhostSlotProps> = ({
  className,
  generation,
  hint,
  slotNumber,
  style,
  title
}) => (
  <span
    className={classNames('slot', generationClass(generation), className)}
    style={style}
  >
    <span className='slot-number'>{slotNumberText(slotNumber)}</span>
    <span className='slot-bed'>
      <span className='ghost-slot'>
        <span className='ghost-slot-title'>{title}</span>
        <span className='ghost-slot-hint'>{hint}</span>
      </span>
    </span>
  </span>
)
