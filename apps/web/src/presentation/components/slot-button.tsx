import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import { Button, type ButtonProps } from 'react-aria-components'

import './slot-button.sass'

/** A slot that does something when touched: it holds a `Sticker`, lifted under the pointer, or a `GhostSlot`, its outline darkened. */
export const SlotButton: React.FC<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <Button {...props} className={composeClassName(className, 'slot-button')} />
)
