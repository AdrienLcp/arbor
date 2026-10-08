import type React from 'react'

import { ButtonLink } from '@/presentation/components/button-link'
import { SheetIcon } from '@/presentation/components/icons'
import { slotNumberText } from '@/presentation/components/slot-number'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PersonFace } from './person-face'

import './focus-card.sass'

type FocusCardProps = {
  face: PersonFace
  sheetPath: string
}

/** The person in the middle of the canvas, named in readable type, with the way to their sheet. */
export const FocusCard: React.FC<FocusCardProps> = ({ face, sheetPath }) => {
  const translate = useTranslate()

  return (
    <div className='focus-card'>
      <p className='focus-card-text'>
        <span className='focus-card-name'>{face.name}</span>
        <span className='focus-card-facts'>
          {[
            translate('sheet.slot', {
              number: slotNumberText(face.slotNumber)
            }),
            face.years
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </p>
      <ButtonLink href={sheetPath}>
        <SheetIcon aria-hidden='true' />
        {translate('sheet.openShort')}
      </ButtonLink>
    </div>
  )
}
