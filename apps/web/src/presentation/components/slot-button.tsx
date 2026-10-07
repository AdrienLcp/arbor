import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import { Button, type ButtonProps } from 'react-aria-components'

import './slot-button.sass'

/** A numbered slot that does something when touched: it holds a `Sticker` and lifts it under the pointer. */
export const SlotButton: React.FC<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
> = ({ className, ...props }) => (
  <Button {...props} className={composeClassName(className, 'slot-button')} />
)
