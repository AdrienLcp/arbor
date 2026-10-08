import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from './generation-class'

import './mini-sticker.sass'

type MiniStickerProps = {
  /** Counted from the oldest generation, 1 first: it picks the sticker's ink. */
  generation: number
  /** A deceased person's sticker is matte, its art dulled (The Matte Means Gone Rule). */
  isDeceased: boolean
  /** The initials drawn on the art. */
  monogram: string
  /** A picture laid over the monogram: the person's portrait, when they have one. */
  portrait?: React.ReactNode
}

/** A person's sticker at list size, beside their name. Decorative: the name next to it is what is read. */
export const MiniSticker: React.FC<MiniStickerProps> = ({
  generation,
  isDeceased,
  monogram,
  portrait
}) => (
  <span
    aria-hidden='true'
    className={classNames(
      'mini-sticker',
      generationClass(generation),
      isDeceased && 'deceased'
    )}
  >
    <span className='mini-sticker-art'>
      {monogram}
      {portrait}
    </span>
  </span>
)
