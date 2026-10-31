import type React from 'react'

import { Button } from '@/presentation/components/button'
import { HiddenIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import './hidden-note.sass'

type HiddenNoteProps = {
  count: number
  onChoose: () => void
}

/** Under the tree's title while people are hidden on this device, so nobody vanishes without a trace; nothing when everyone is shown. */
export const HiddenNote: React.FC<HiddenNoteProps> = ({ count, onChoose }) => {
  const translate = useTranslate()
  if (count === 0) return null

  return (
    <p className='hidden-note'>
      <HiddenIcon aria-hidden='true' className='hidden-note-icon' />
      <span>
        <strong>{translate('tree.choose.hiddenNote', { count })}</strong>{' '}
        <Button
          className='hidden-note-choose'
          onPress={onChoose}
          variant='link'
        >
          {translate('tree.choose.action')}
        </Button>
      </span>
    </p>
  )
}
