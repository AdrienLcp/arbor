import { classNames } from '@adrienlcp/react'
import type React from 'react'

import './tree-mark.sass'

type TreeMarkProps = {
  /** Drawn white on the vermilion cover rather than vermilion on paper. */
  isOnCover?: boolean
}

/** Arbor's mark: an hourglass tree, its roots the ancestors and its crown the descendants. Decorative. */
export const TreeMark: React.FC<TreeMarkProps> = ({ isOnCover = false }) => (
  <svg
    aria-hidden='true'
    className={classNames('tree-mark', isOnCover && 'on-cover')}
    viewBox='0 0 32 32'
  >
    <g
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='3'
    >
      <path d='M16 29V3.5' />
      <path d='M16 17C16 12 10 12 10 5.5' />
      <path d='M16 17C16 12 22 12 22 5.5' />
      <path d='M12.75 11C9 11.5 4.5 12.5 4.5 9.5' />
      <path d='M19.25 11C23 11.5 27.5 12.5 27.5 9.5' />
      <path d='M16 22C16 26 11 26.5 6.5 28.5' />
      <path d='M16 22C16 26 21 26.5 25.5 28.5' />
    </g>
  </svg>
)
