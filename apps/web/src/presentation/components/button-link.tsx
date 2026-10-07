import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import { Link as AriaLink, type LinkProps } from 'react-aria-components'

import type { ButtonVariant } from './button-variant'

import './button.sass'

export type ButtonLinkProps = LinkProps & {
  /** Stretches the link to the width of its container. */
  isBlock?: boolean
  variant?: ButtonVariant
}

/** A link that moves to another page, drawn as a button. */
export const ButtonLink: React.FC<ButtonLinkProps> = ({
  className,
  isBlock = false,
  variant = 'primary',
  ...props
}) => (
  <AriaLink
    {...props}
    className={composeClassName(
      className,
      'button',
      variant,
      isBlock && 'block'
    )}
  />
)
