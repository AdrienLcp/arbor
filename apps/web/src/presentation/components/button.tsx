import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps
} from 'react-aria-components'

import type { ButtonVariant } from './button-variant'

import './button.sass'

export type ButtonProps = AriaButtonProps & {
  /** Stretches the button to the width of its container. */
  isBlock?: boolean
  variant?: ButtonVariant
}

export const Button: React.FC<ButtonProps> = ({
  className,
  isBlock = false,
  variant = 'primary',
  ...props
}) => (
  <AriaButton
    {...props}
    className={composeClassName(
      className,
      'button',
      variant,
      isBlock && 'block'
    )}
  />
)
