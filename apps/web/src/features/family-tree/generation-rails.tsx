import { classNames } from '@adrienlcp/react'
import type React from 'react'

import { generationClass } from '@/presentation/components/generation-class'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { GenerationBand, TreeScene } from './tree-scene'

import './generation-rails.sass'

const GenerationRail: React.FC<{ band: GenerationBand }> = ({ band }) => {
  const translate = useTranslate()

  return (
    <>
      <span className='generation-rail-head'>
        {translate('tree.generation', { number: band.generation })}
      </span>
      {band.births === null ? null : (
        <span className='generation-rail-years'>
          {band.births.first === band.births.last
            ? String(band.births.first)
            : translate('tree.years', {
                first: String(band.births.first),
                last: String(band.births.last)
              })}
        </span>
      )}
      <span className='generation-rail-count'>
        {translate('tree.people', { count: band.personCount })}
      </span>
      {band.missingCount === 0 ? null : (
        <span className='generation-rail-count'>
          {translate('tree.missing', { count: band.missingCount })}
        </span>
      )}
    </>
  )
}

type GenerationRailsProps = {
  /** Receives the element whose `--pan-y` and `--zoom` follow the canvas, so the rails stay level with their bands. */
  ref: React.Ref<HTMLDivElement>
  scene: TreeScene
}

/** The head of each generation band, pinned to the left edge of the canvas while the tree pans under it. */
export const GenerationRails: React.FC<GenerationRailsProps> = ({
  ref,
  scene
}) => (
  <div aria-hidden='true' className='generation-rails' ref={ref}>
    {scene.bands.map((band) => (
      <div
        className={classNames(
          'generation-rail',
          generationClass(band.generation)
        )}
        key={band.generation}
        style={{
          '--band-height': `${band.bottom - band.top}px`,
          '--band-top': `${band.top - scene.origin.y}px`
        }}
      >
        <GenerationRail band={band} />
      </div>
    ))}
  </div>
)
