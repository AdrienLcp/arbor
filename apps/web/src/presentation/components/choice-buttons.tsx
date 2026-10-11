import type React from 'react'

import { Button } from './button'

import './choice-buttons.sass'

export type ChoiceButton = {
  hint: string
  id: string
  isDisabled?: boolean
  onPress: () => void
  title: string
}

/** A short list of paths to take, a whole line each: its name in the album's label voice and what it means in words below. */
export const ChoiceButtons: React.FC<{ choices: readonly ChoiceButton[] }> = ({
  choices
}) => (
  <ul className='choice-buttons'>
    {choices.map((choice) => (
      <li key={choice.id}>
        <Button
          className='choice-button'
          isBlock
          isDisabled={choice.isDisabled}
          onPress={choice.onPress}
          variant='quiet'
        >
          <span className='choice-button-title'>{choice.title}</span>
          <span className='choice-button-hint'>{choice.hint}</span>
        </Button>
      </li>
    ))}
  </ul>
)
