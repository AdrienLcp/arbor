import type React from 'react'

import { GhostSlot } from '@/presentation/components/ghost-slot'
import { monogramOf } from '@/presentation/components/monogram'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './founder-preview.sass'

const FOUNDER_SLOT = 1
const FOUNDER_GENERATION = 1

type FounderPreviewProps = {
  givenNames: string
  surname: string
}

/** Slot 01 of the album, waiting, then holding the creator's sticker once they start typing their name. */
export const FounderPreview: React.FC<FounderPreviewProps> = ({
  givenNames,
  surname
}) => {
  const translate = useTranslate()
  const hasName = `${givenNames}${surname}`.trim() !== ''

  return (
    <figure className='founder-preview'>
      {hasName ? (
        <Sticker
          className='pressing'
          generation={FOUNDER_GENERATION}
          givenNames={givenNames}
          monogram={monogramOf({ givenNames, surname })}
          slotNumber={FOUNDER_SLOT}
          surname={surname}
        />
      ) : (
        <GhostSlot
          generation={FOUNDER_GENERATION}
          hint={translate('createFamily.preview.hint')}
          slotNumber={FOUNDER_SLOT}
          title={translate('createFamily.preview.title')}
        />
      )}
      <figcaption className='founder-preview-label'>
        {translate('createFamily.preview.label')}
      </figcaption>
    </figure>
  )
}
