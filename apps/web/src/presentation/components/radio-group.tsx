import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
  Label
} from 'react-aria-components'

import './radio-group.sass'

export type RadioGroupProps = Omit<AriaRadioGroupProps, 'children'> & {
  children: React.ReactNode
  label: string
}

/** One choice among a few, laid out as a segmented row once there is room for it. */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  className,
  label,
  ...props
}) => (
  <AriaRadioGroup
    {...props}
    className={composeClassName(className, 'radio-group')}
  >
    <Label className='radio-group-label'>{label}</Label>
    <div className='radio-group-choices'>{children}</div>
  </AriaRadioGroup>
)

export type RadioProps = Omit<AriaRadioProps, 'children'> & {
  children: React.ReactNode
}

export const Radio: React.FC<RadioProps> = ({
  children,
  className,
  ...props
}) => (
  <AriaRadio {...props} className={composeClassName(className, 'radio')}>
    {children}
  </AriaRadio>
)
