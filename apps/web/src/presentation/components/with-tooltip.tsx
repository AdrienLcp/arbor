import type React from 'react'
import {
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger
} from 'react-aria-components'

import './with-tooltip.sass'

/** How long the pointer rests on a button before its name shows: long enough not to flicker across a toolbar. */
const OPEN_DELAY_MS = 500

export type WithTooltipProps = {
  /** A react-aria button: the one thing the tooltip names. */
  children: React.ReactElement
  /** The button's name, the same words as its `aria-label`. */
  label: string
  placement?: AriaTooltipProps['placement']
}

/**
 * Names an icon-only button on hover and keyboard focus. A touch never shows it,
 * so a button whose meaning a touch screen needs keeps its word on screen instead.
 */
export const WithTooltip: React.FC<WithTooltipProps> = ({
  children,
  label,
  placement = 'top'
}) => (
  <TooltipTrigger closeDelay={0} delay={OPEN_DELAY_MS}>
    {children}
    <AriaTooltip className='tooltip' offset={8} placement={placement}>
      {label}
    </AriaTooltip>
  </TooltipTrigger>
)
