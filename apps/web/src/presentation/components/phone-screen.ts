import { SCREEN_SIZES } from '@/presentation/styles/screen-sizes'

/**
 * Under the app's wide-screen breakpoint, or on a screen as short as a phone
 * held sideways, the tree's canvas gives way to one page at a time: the
 * complement of `layout.canvas-screen`.
 */
export const PHONE_SCREEN = `(width < ${SCREEN_SIZES.wideScreen}), (height < ${SCREEN_SIZES.shortScreen})`
