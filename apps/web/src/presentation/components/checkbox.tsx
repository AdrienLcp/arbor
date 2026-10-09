import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps
} from 'react-aria-components'

import { CheckIcon } from './icons'

import './checkbox.sass'

export type CheckboxProps = Omit<AriaCheckboxProps, 'children'> & {
  children: React.ReactNode
}

/** Yes or no inside a form, kept until the form is saved; the whole line is the target. */
export const Checkbox: React.FC<CheckboxProps> = ({
  children,
  className,
  ...props
}) => (
  <AriaCheckbox {...props} className={composeClassName(className, 'checkbox')}>
    <span aria-hidden='true' className='checkbox-box'>
      <CheckIcon className='checkbox-mark' />
    </span>
    <span className='checkbox-label'>{children}</span>
  </AriaCheckbox>
)
