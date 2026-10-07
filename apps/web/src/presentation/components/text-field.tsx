import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  FieldError,
  Input,
  Label,
  Text
} from 'react-aria-components'

import './text-field.sass'

export type TextFieldProps = Omit<AriaTextFieldProps, 'children'> & {
  /** A line under the field that says what to type, read with it by a screen reader. */
  description?: string
  /** Shown under the field while it is invalid; the browser's own message otherwise. */
  errorMessage?: string
  label: string
  placeholder?: string
}

export const TextField: React.FC<TextFieldProps> = ({
  className,
  description,
  errorMessage,
  label,
  placeholder,
  ...props
}) => (
  <AriaTextField
    {...props}
    className={composeClassName(className, 'text-field')}
  >
    <Label className='field-label'>{label}</Label>
    <Input className='field-input' placeholder={placeholder} />
    {description === undefined ? null : (
      <Text className='field-description' slot='description'>
        {description}
      </Text>
    )}
    <FieldError className='field-error'>{errorMessage}</FieldError>
  </AriaTextField>
)
