import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
  Label
} from 'react-aria-components'

import './meter.sass'

export type MeterProps = Omit<AriaMeterProps, 'children'> & {
  /** Draws the fill in the warning amber: the quantity is close to its limit. */
  isNearLimit?: boolean
  label: string
}

/** How full something is: a label, the amount in words, a bar. */
export const Meter: React.FC<MeterProps> = ({
  className,
  isNearLimit = false,
  label,
  ...props
}) => (
  <AriaMeter
    {...props}
    className={composeClassName(
      className,
      'meter',
      isNearLimit && 'near-limit'
    )}
  >
    {({ percentage, valueText }) => (
      <>
        <span className='meter-head'>
          <Label className='meter-label'>{label}</Label>
          <span className='meter-value'>{valueText}</span>
        </span>
        <span className='meter-bar'>
          <span
            className='meter-fill'
            style={{ '--meter-fill': `${percentage}%` }}
          />
        </span>
      </>
    )}
  </AriaMeter>
)
