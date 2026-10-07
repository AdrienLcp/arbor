import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps
} from 'react-aria-components'

import './switch.sass'

export type SwitchProps = Omit<AriaSwitchProps, 'children'> & {
  children: React.ReactNode
}

/** On or off, applied at once: no save button behind it. */
export const Switch: React.FC<SwitchProps> = ({
  children,
  className,
  ...props
}) => (
  <AriaSwitch {...props} className={composeClassName(className, 'switch')}>
    <span aria-hidden='true' className='switch-track' />
    <span className='switch-label'>{children}</span>
  </AriaSwitch>
)
