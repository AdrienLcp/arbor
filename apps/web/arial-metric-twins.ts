/** The local faces drawn to Arial's metrics: Linux has no Arial and Android has only Roboto. */
const ARIAL_TWINS =
  'local("Arial"), local("Liberation Sans"), local("Arimo"), local("Roboto")'

const ARIAL_ALONE = /^local\(\s*["']?Arial["']?\s*\)$/

interface Declaration {
  prop: string
  value: string
}

interface FontFaceRule {
  walkDecls: (callback: (declaration: Declaration) => void) => void
}

/**
 * PostCSS plugin run after fontaine: widens the `src` of each metric-matched
 * fallback face from Arial alone to Arial and its twins, so the fallback loads
 * on every system and the swap to the web font moves no line.
 */
export const arialMetricTwins = {
  AtRule: {
    'font-face': (rule: FontFaceRule) => {
      rule.walkDecls((declaration) => {
        if (declaration.prop === 'src' && ARIAL_ALONE.test(declaration.value)) {
          declaration.value = ARIAL_TWINS
        }
      })
    }
  },
  postcssPlugin: 'arial-metric-twins'
}
