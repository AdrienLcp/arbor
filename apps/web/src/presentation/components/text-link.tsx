import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import { Link as AriaLink, type LinkProps } from 'react-aria-components'

import './text-link.sass'

/** A link inside a sentence. */
export const TextLink: React.FC<LinkProps> = ({ className, ...props }) => (
  <AriaLink {...props} className={composeClassName(className, 'text-link')} />
)
