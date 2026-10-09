/**
 * Where a screen stops being a phone's, read by the stylesheets (`_layout.sass`
 * through the `arbor:screen-sizes` Sass module) and by the scripts alike. In
 * rem, as a media query reads rem off the browser's font size.
 */
export const SCREEN_SIZES = {
  /** Shorter than this, a phone held sideways. */
  shortScreen: '30rem',
  /** Narrower than this, a phone held upright. */
  wideScreen: '40rem'
} as const
