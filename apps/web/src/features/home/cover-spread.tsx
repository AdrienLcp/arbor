import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from '@/presentation/components/generation-class'
import { GhostSlot } from '@/presentation/components/ghost-slot'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './cover-spread.sass'

const COUPLE_GENERATION = 1
const CHILDREN_GENERATION = 2
const COUPLE_SLOTS = ['eldest', 'partner'] as const
const CHILD_SLOTS = ['firstChild', 'otherChild'] as const

type SpreadSlot = (typeof COUPLE_SLOTS)[number] | (typeof CHILD_SLOTS)[number]

/** The album's first page, still empty, drawn as the smallest tree: an eldest couple joined by their line, and two children hanging from it. */
export const CoverSpread: React.FC = () => {
  const translate = useTranslate()

  const slotOf = (generation: number, slot: SpreadSlot) => (
    <GhostSlot
      generation={generation}
      hint={translate(`home.spread.${slot}`)}
      title={translate('home.spread.slotTitle')}
    />
  )

  return (
    <figure className='cover-spread'>
      <div aria-hidden='true' className='spread-tree'>
        <div
          className={classNames(
            'spread-row',
            'spread-couple',
            generationClass(COUPLE_GENERATION)
          )}
        >
          {COUPLE_SLOTS.map((slot) => (
            <span className='spread-place' key={slot}>
              {slotOf(COUPLE_GENERATION, slot)}
            </span>
          ))}
        </div>
        <div
          className={classNames(
            'spread-row',
            'spread-children',
            generationClass(CHILDREN_GENERATION)
          )}
        >
          {CHILD_SLOTS.map((slot) => (
            <span className='spread-place' key={slot}>
              {slotOf(CHILDREN_GENERATION, slot)}
            </span>
          ))}
        </div>
      </div>
      <figcaption className='spread-hint'>
        {translate('home.spread.hint')}
      </figcaption>
    </figure>
  )
}
