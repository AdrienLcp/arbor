import type React from 'react'
import { Button } from 'react-aria-components'

import { ChevronIcon, PreviousIcon } from '@/presentation/components/icons'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PersonFace } from './person-face'

import './spread-bar.sass'

type SpreadBarProps = {
  /** The first and last birth years of the page's generation, `null` when none is known. */
  births: { first: number; last: number } | null
  focus: PersonFace
  /** The page one generation down: the eldest child's, `null` without a child. */
  next: PersonFace | null
  onTurn: (personId: string) => void
  /** The page one generation up: the first parent's, `null` without a parent. */
  previous: PersonFace | null
}

const TurnButton: React.FC<{
  children: React.ReactNode
  label: string
  onPress: () => void
}> = ({ children, label, onPress }) => (
  <Button aria-label={label} className='spread-bar-turn' onPress={onPress}>
    {children}
  </Button>
)

/** The bar at the top of a phone page: its generation and whose page it is, with a turn up to a parent and down to a child. */
export const SpreadBar: React.FC<SpreadBarProps> = ({
  births,
  focus,
  next,
  onTurn,
  previous
}) => {
  const translate = useTranslate()
  const years =
    births === null
      ? null
      : births.first === births.last
        ? String(births.first)
        : translate('tree.years', {
            first: String(births.first),
            last: String(births.last)
          })
  const page = translate('tree.spread.page', { name: focus.givenNames })

  return (
    <div className='spread-bar'>
      {previous === null ? (
        <span className='spread-bar-turn' />
      ) : (
        <TurnButton
          label={translate('tree.spread.previous', { name: previous.name })}
          onPress={() => onTurn(previous.id)}
        >
          <PreviousIcon aria-hidden='true' />
        </TurnButton>
      )}
      <p className='spread-bar-title'>
        {translate('tree.generation', { number: focus.generation })}
        <span className='spread-bar-subtitle'>
          {years === null ? page : `${years} · ${page}`}
        </span>
      </p>
      {next === null ? (
        <span className='spread-bar-turn' />
      ) : (
        <TurnButton
          label={translate('tree.spread.next', { name: next.name })}
          onPress={() => onTurn(next.id)}
        >
          <ChevronIcon aria-hidden='true' />
        </TurnButton>
      )}
    </div>
  )
}
