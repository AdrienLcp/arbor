import { composeClassName } from '@adrienlcp/react-aria'
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  Button,
  type Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue
} from 'react-aria-components'

import { OpenListIcon } from './icons'

import './select.sass'

export type SelectOption<Value extends string> = {
  label: string
  value: Value
}

export type SelectProps<Value extends string> = Omit<
  AriaSelectProps,
  'children' | 'onChange' | 'selectionMode' | 'value'
> & {
  label: string
  onChange: (value: Value) => void
  options: readonly SelectOption<Value>[]
  value: Value
}

/** One choice among many, folded into a field until touched: a month, a kind of date. */
export const Select = <Value extends string>({
  className,
  label,
  onChange,
  options,
  value,
  ...props
}: SelectProps<Value>) => {
  const choose = (chosen: Key | null) => {
    const option = options.find((candidate) => candidate.value === chosen)
    if (option !== undefined) {
      onChange(option.value)
    }
  }

  return (
    <AriaSelect
      {...props}
      className={composeClassName(className, 'select')}
      onChange={choose}
      value={value}
    >
      <Label className='field-label'>{label}</Label>
      <Button className='select-button'>
        <SelectValue className='select-value' />
        <OpenListIcon aria-hidden='true' className='select-icon' />
      </Button>
      <Popover className='select-popover' offset={6}>
        <ListBox className='select-list'>
          {options.map((option) => (
            <ListBoxItem
              className='select-option'
              id={option.value}
              key={option.value}
            >
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
