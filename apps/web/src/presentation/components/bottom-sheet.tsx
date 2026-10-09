import type React from 'react'
import {
  Sheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay
} from 'react-aria-components/Sheet'

import './bottom-sheet.sass'

/** How much of the sheet shows when it opens, as a share of its height; a swipe up reveals the rest. */
export const BOTTOM_SHEET_PEEK = 0.5

const SNAP_POINTS = [`${BOTTOM_SHEET_PEEK * 100}%`, '100%']

/** The element react-aria scrolls to swipe the sheet: scrolled to its end, the sheet stands at its whole height. */
const SWIPE_AREA = '[data-sheet-scroll]'

/** A control the keyboard reaches under a half-open sheet's fold would be out of sight: the sheet rises to its whole height first. */
const riseToKeyboardFocusIn = (content: HTMLDivElement | null) => {
  if (content === null) return
  const rise = (event: FocusEvent) => {
    if (!(event.target instanceof HTMLElement)) return
    if (!event.target.matches(':focus-visible')) return
    const swipeArea = content.closest(SWIPE_AREA)
    swipeArea?.scrollTo({ top: swipeArea.scrollHeight })
  }
  content.addEventListener('focusin', rise)
  return () => content.removeEventListener('focusin', rise)
}

type BottomSheetProps = {
  children: React.ReactNode
  isOpen: boolean
  /** Names the sheet for a screen reader. */
  label: string
  /** Called when the visitor swipes the sheet away, presses Escape or touches the page above it. */
  onClose: () => void
}

/** A paper sheet rising from the bottom of a phone over the page, which stays in sight above it; half open, then the whole height on a swipe up. */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  label,
  onClose
}) => (
  <SheetOverlay
    className='bottom-sheet-overlay'
    isOpen={isOpen}
    onOpenChange={(isStillOpen) => {
      if (!isStillOpen) onClose()
    }}
    position='bottom'
    snapPoints={SNAP_POINTS}
  >
    <SheetBackdrop className='bottom-sheet-backdrop' />
    <Sheet className='bottom-sheet'>
      <span aria-hidden='true' className='bottom-sheet-handle' />
      <SheetContent
        aria-label={label}
        className='bottom-sheet-content'
        ref={riseToKeyboardFocusIn}
      >
        {children}
      </SheetContent>
    </Sheet>
  </SheetOverlay>
)
