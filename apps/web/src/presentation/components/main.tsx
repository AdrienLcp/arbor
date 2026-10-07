import { classNames } from '@adrienlcp/react'
import type React from 'react'

import './main.sass'

const MAIN_ID = 'main'

export const MAIN_HREF = `#${MAIN_ID}`

/** A click on the bare background would focus the landmark and blink a caret beside no text. */
const keepBackgroundClicksInert = (
  event: React.MouseEvent<HTMLElement>
): void => {
  if (event.target === event.currentTarget) {
    event.preventDefault()
  }
}

type MainProps = Omit<
  React.ComponentProps<'main'>,
  'id' | 'onMouseDown' | 'tabIndex'
>

/** The page's landmark: where the skip link points and where focus lands after a navigation. */
export const Main: React.FC<MainProps> = ({ className, ...props }) => (
  <main
    {...props}
    className={classNames('main', className)}
    id={MAIN_ID}
    onMouseDown={keepBackgroundClicksInert}
    tabIndex={-1}
  />
)

export const focusMain = (options?: FocusOptions): void => {
  document.getElementById(MAIN_ID)?.focus(options)
}
