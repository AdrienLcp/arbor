import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover
} from 'react-aria-components'

import { SearchIcon } from './icons'

import './combo-box.sass'

export type ComboBoxProps<Item extends object> = Omit<
  AriaComboBoxProps<Item>,
  'children'
> & {
  children: (item: Item) => React.ReactNode
  /** Shown in the open list when nothing matches what was typed. */
  emptyText: string
  label: string
  placeholder?: string
}

/** A field that suggests matching items as it is typed into, and picks one. */
export const ComboBox = <Item extends object>({
  children,
  className,
  emptyText,
  label,
  placeholder,
  ...props
}: ComboBoxProps<Item>) => {
  const renderEmptyState = () => <p className='combo-box-empty'>{emptyText}</p>

  return (
    <AriaComboBox
      {...props}
      className={composeClassName(className, 'combo-box')}
    >
      <Label className='combo-box-label'>{label}</Label>
      <span className='combo-box-field'>
        <SearchIcon aria-hidden='true' className='combo-box-icon' />
        <Input className='combo-box-input' placeholder={placeholder} />
      </span>
      <Popover className='combo-box-popover' offset={6}>
        <ListBox className='combo-box-list' renderEmptyState={renderEmptyState}>
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  )
}

/** One suggestion in a `ComboBox`. */
export const ComboBoxItem: React.FC<ListBoxItemProps> = ({
  className,
  ...props
}) => (
  <ListBoxItem
    {...props}
    className={composeClassName(className, 'combo-box-item')}
  />
)
