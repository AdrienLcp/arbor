import { composeClassName } from '@adrienlcp/react-aria'
import {
  Label,
  Radio,
  RadioGroup,
  type RadioGroupProps
} from 'react-aria-components'

import './choice-list.sass'

export type Choice<Value extends string> = {
  label: string
  value: Value
}

export type ChoiceListProps<Value extends string> = Omit<
  RadioGroupProps,
  'children' | 'onChange' | 'orientation' | 'value'
> & {
  label: string
  onChange: (value: Value) => void
  options: readonly Choice<Value>[]
  value: Value
}

/** One choice among a few that need a whole line each: which union a child is born of. */
export const ChoiceList = <Value extends string>({
  className,
  label,
  onChange,
  options,
  value,
  ...props
}: ChoiceListProps<Value>) => {
  const choose = (chosen: string) => {
    const option = options.find((candidate) => candidate.value === chosen)
    if (option !== undefined) {
      onChange(option.value)
    }
  }

  return (
    <RadioGroup
      {...props}
      className={composeClassName(className, 'choice-list')}
      onChange={choose}
      value={value}
    >
      <Label className='field-label'>{label}</Label>
      {options.map((option) => (
        <Radio className='choice' key={option.value} value={option.value}>
          <span aria-hidden='true' className='choice-mark' />
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  )
}
