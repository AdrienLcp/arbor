import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Label,
  Text,
  TextArea
} from 'react-aria-components'

import './text-field.sass'

export type TextAreaFieldProps = Omit<AriaTextFieldProps, 'children'> & {
  /** A line under the field that says what to write, read with it by a screen reader. */
  description?: string
  label: string
}

/** A field for a few lines of free text: notes, a story. */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  className,
  description,
  label,
  ...props
}) => (
  <AriaTextField
    {...props}
    className={composeClassName(className, 'text-field')}
  >
    <Label className='field-label'>{label}</Label>
    <TextArea className='field-input field-text-area' rows={4} />
    {description === undefined ? null : (
      <Text className='field-description' slot='description'>
        {description}
      </Text>
    )}
  </AriaTextField>
)
