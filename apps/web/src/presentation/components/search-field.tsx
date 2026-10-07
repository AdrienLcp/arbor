import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  Button,
  Input,
  Label
} from 'react-aria-components'

import { ClearIcon, SearchIcon } from './icons'

import './search-field.sass'

export type SearchFieldProps = Omit<AriaSearchFieldProps, 'children'> & {
  /** Names the button that empties the field. */
  clearLabel: string
  label: string
  placeholder?: string
}

/** A field that narrows a list as it is typed into, with a button to empty it. */
export const SearchField: React.FC<SearchFieldProps> = ({
  className,
  clearLabel,
  label,
  placeholder,
  ...props
}) => (
  <AriaSearchField
    {...props}
    className={composeClassName(className, 'search-field')}
  >
    <Label className='search-label'>{label}</Label>
    <span className='search-box'>
      <SearchIcon aria-hidden='true' className='search-icon' />
      <Input className='search-input' placeholder={placeholder} />
      <Button aria-label={clearLabel} className='search-clear'>
        <ClearIcon aria-hidden='true' />
      </Button>
    </span>
  </AriaSearchField>
)
