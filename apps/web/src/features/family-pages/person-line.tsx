import type React from 'react'

import { MiniSticker } from '@/presentation/components/mini-sticker'
import { monogramOf } from '@/presentation/components/monogram'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { ListedPerson } from './family-people'
import { lifeYears } from './life-years'
import { personName } from './person-name'

import './person-line.sass'

type PersonLineProps = {
  /** Marks the line as the visitor's own. */
  isMe: boolean
  listed: ListedPerson
}

/** One person in a list: their sticker, their name, their years. */
export const PersonLine: React.FC<PersonLineProps> = ({
  isMe,
  listed: { generation, isLiving, person }
}) => {
  const translate = useTranslate()
  const years = lifeYears(person, isLiving)

  return (
    <span className='person-line'>
      <MiniSticker
        generation={generation}
        isDeceased={!isLiving}
        monogram={monogramOf(person)}
      />
      <span className='person-line-text'>
        <span className='person-line-name'>
          {personName(person) ?? translate('common.unnamedPerson')}
          {isMe ? (
            <span className='person-line-me'>
              {translate('familyHome.you')}
            </span>
          ) : null}
        </span>
        {years === '' ? null : (
          <span className='person-line-years'>{years}</span>
        )}
      </span>
    </span>
  )
}
