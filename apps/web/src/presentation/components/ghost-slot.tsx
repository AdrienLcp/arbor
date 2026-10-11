import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from './generation-class'
import { AddIcon } from './icons'

import './slot.sass'

type GhostSlotProps = {
  /** The word on the round pill that invites to fill the slot: "Complete". Left out where the slot cannot be pressed. */
  action?: string
  className?: string
  /** Counted from the oldest generation, 1 first: it tints the slot like its row. */
  generation: number
  /** Who belongs here: "the eldest you know of". */
  hint: string
  /** Hands the slot its size, `--slot-width` and `--slot-height`. */
  style?: React.CSSProperties
  /** The word printed in the empty outline: "Stick here". */
  title: string
}

/** An empty slot, printed in outline: a person still to add. Phrasing content only, so a button may hold it. */
export const GhostSlot: React.FC<GhostSlotProps> = ({
  action,
  className,
  generation,
  hint,
  style,
  title
}) => (
  <span
    className={classNames('slot', generationClass(generation), className)}
    style={style}
  >
    <span className='slot-bed'>
      <span className='ghost-slot'>
        <span className='ghost-slot-title'>{title}</span>{' '}
        <span className='ghost-slot-hint'>{hint}</span>
        {action === undefined ? null : (
          <>
            {' '}
            <span className='ghost-slot-action'>
              <AddIcon aria-hidden='true' />
              {action}
            </span>
          </>
        )}
      </span>
    </span>
  </span>
)
