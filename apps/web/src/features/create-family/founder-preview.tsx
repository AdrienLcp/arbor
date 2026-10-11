import type React from 'react'

import { GhostSlot } from '@/presentation/components/ghost-slot'
import { monogramOf } from '@/presentation/components/monogram'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './founder-preview.sass'

const FOUNDER_GENERATION = 1

type FounderPreviewProps = {
  givenNames: string
  /** Whether the tree starts with its creator: the slot then says "you". */
  isCreator: boolean
  surname: string
}

/** The album's first slot, waiting, then holding the founder's sticker once their name is being typed. */
export const FounderPreview: React.FC<FounderPreviewProps> = ({
  givenNames,
  isCreator,
  surname
}) => {
  const translate = useTranslate()
  const hasName = `${givenNames}${surname}`.trim() !== ''
  const founder = isCreator ? 'me' : 'someoneElse'

  return (
    <figure className='founder-preview'>
      {hasName ? (
        <Sticker
          className='pressing'
          generation={FOUNDER_GENERATION}
          givenNames={givenNames}
          monogram={monogramOf({ givenNames, surname })}
          surname={surname}
        />
      ) : (
        <GhostSlot
          generation={FOUNDER_GENERATION}
          hint={translate(`createFamily.${founder}.previewHint`)}
          title={translate('createFamily.preview.title')}
        />
      )}
      <figcaption className='founder-preview-label'>
        {translate(`createFamily.${founder}.previewLabel`)}
      </figcaption>
    </figure>
  )
}
