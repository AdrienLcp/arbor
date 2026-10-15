/**
 * Where a screen stops being a phone's, read by the stylesheets (`_layout.sass`
 * through the `values:screen-sizes` Sass module) and by the scripts alike. In
 * rem, as a media query reads rem off the browser's font size.
 */
export const SCREEN_SIZES = {
  /** Narrower than this, the app bar folds its actions into "More" and the tree gives a phone held upright the whole screen. */
  foldedBar: '30rem',
  /** Shorter than this, a phone held sideways. */
  shortScreen: '30rem',
  /** Narrower than this, a phone held upright. */
  wideScreen: '40rem'
} as const
