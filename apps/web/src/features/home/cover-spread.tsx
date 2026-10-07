import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from '@/presentation/components/generation-class'
import { GhostSlot } from '@/presentation/components/ghost-slot'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './cover-spread.sass'

/** The album's first spread, still empty: an eldest couple, then two children. */
const SPREAD_PAGES = [
  { generation: 1, slots: ['eldest', 'partner'] },
  { generation: 2, slots: ['firstChild', 'otherChild'] }
] as const

/** The empty first spread lying on the cover: shows what the album is before anything is in it. */
export const CoverSpread: React.FC = () => {
  const translate = useTranslate()

  return (
    <figure className='cover-spread'>
      <div aria-hidden='true' className='spread-pages'>
        {SPREAD_PAGES.map(({ generation, slots }, pageIndex) => (
          <div
            className={classNames('spread-page', generationClass(generation))}
            key={generation}
          >
            <p className='spread-head'>
              {translate('home.spread.generation', { number: generation })}
            </p>
            <div className='spread-slots'>
              {slots.map((slot, slotIndex) => (
                <GhostSlot
                  generation={generation}
                  hint={translate(`home.spread.${slot}`)}
                  key={slot}
                  slotNumber={pageIndex * slots.length + slotIndex + 1}
                  title={translate('home.spread.slotTitle')}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <figcaption className='spread-hint'>
        {translate('home.spread.hint')}
      </figcaption>
    </figure>
  )
}
