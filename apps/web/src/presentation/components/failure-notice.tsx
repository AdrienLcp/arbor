import type React from 'react'

import { WarningIcon } from './icons'

import './failure-notice.sass'

/** Says, as soon as it appears, that an action did not go through and what to do about it. */
export const FailureNotice: React.FC<{ children: string }> = ({ children }) => (
  <p className='failure-notice' role='alert'>
    <WarningIcon aria-hidden='true' className='failure-notice-icon' />
    {children}
  </p>
)
