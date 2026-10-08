import { identityBlock } from './identity-block'
import { legendColumns } from './legend-columns'
import { liveLinkBlock } from './live-link-block'
import type { PanelPlan, PanelWords } from './panel-plan'
import type { Size } from './print-pages'
import { PRINT_TYPE_SCALE } from './print-type-scale'

const TITLE_MAX = 24

const { foot, heading } = PRINT_TYPE_SCALE

/** The printed side as a column beside the tree: name and legend from the top, the QR code and the printed day at the foot. */
export const columnPanelPlan = ({
  panel,
  words
}: {
  panel: Size
  words: PanelWords
}): PanelPlan => {
  const identity = identityBlock({
    familyName: words.familyName,
    isNameOnOneLine: false,
    summary: words.summary,
    titleMax: TITLE_MAX,
    width: panel.width
  })
  const legend = legendColumns({
    columnCount: 1,
    entries: words.legend,
    width: panel.width
  })
  const live = words.hasLiveLink
    ? liveLinkBlock({ width: panel.width, words: words.liveWords })
    : null

  return {
    foot: { x: 0, y: panel.height },
    identity: { ...identity, x: 0, y: 0 },
    legend: {
      ...legend,
      width: panel.width,
      x: 0,
      y: identity.height + heading.size * 1.6
    },
    liveLink:
      live === null
        ? null
        : { ...live, x: 0, y: panel.height - foot.size * 2.4 - live.height }
  }
}
