import { composeClassName } from '@adrienlcp/react-aria'
import {
  Label,
  Radio,
  RadioGroup,
  type RadioGroupProps
} from 'react-aria-components'

import './segmented-control.sass'

export type SegmentedOption<Value extends string> = {
  label: string
  value: Value
}

export type SegmentedControlProps<Value extends string> = Omit<
  RadioGroupProps,
  'children' | 'onChange' | 'orientation' | 'value'
> & {
  label: string
  onChange: (value: Value) => void
  options: readonly SegmentedOption<Value>[]
  value: Value
}

/** One choice among a few, side by side: the album's view switcher, the current one filled with Generation Pine. */
export const SegmentedControl = <Value extends string>({
  className,
  label,
  onChange,
  options,
  value,
  ...props
}: SegmentedControlProps<Value>) => {
  const choose = (chosen: string) => {
    const option = options.find((candidate) => candidate.value === chosen)
    if (option !== undefined) {
      onChange(option.value)
    }
  }

  return (
    <RadioGroup
      {...props}
      className={composeClassName(className, 'segmented-control')}
      onChange={choose}
      orientation='horizontal'
      value={value}
    >
      <Label className='segmented-label'>{label}</Label>
      <span className='segmented-options'>
        {options.map((option) => (
          <Radio
            className='segmented-option'
            key={option.value}
            value={option.value}
          >
            {option.label}
          </Radio>
        ))}
      </span>
    </RadioGroup>
  )
}
