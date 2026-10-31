import type React from 'react'
import { Label, Radio, RadioGroup } from 'react-aria-components'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import { TIES, type Tie } from './tie'

import './tie-tiles.sass'

type TieTilesProps = {
  onChange: (tie: Tie) => void
  value: Tie | null
}

/** "They are… the child, the parent, the partner, the brother or sister", or not linked yet: whole tiles, read as the middle of a sentence. */
export const TieTiles: React.FC<TieTilesProps> = ({ onChange, value }) => {
  const translate = useTranslate()

  const choose = (chosen: string) => {
    const tie = TIES.find((candidate) => candidate === chosen)
    if (tie !== undefined) onChange(tie)
  }

  return (
    <RadioGroup className='tie-tiles' onChange={choose} value={value}>
      <Label className='add-person-word'>{translate('add.tie.label')}</Label>
      <div className='tie-tiles-choices'>
        {TIES.map((tie) => (
          <Radio
            className={tie === 'none' ? 'tie-tile wide' : 'tie-tile'}
            key={tie}
            value={tie}
          >
            {translate(`add.tie.${tie}`)}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  )
}
