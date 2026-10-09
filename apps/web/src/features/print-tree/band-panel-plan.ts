import { identityBlock } from './identity-block'
import { legendColumns } from './legend-columns'
import { liveLinkBlock, QR_SIZE } from './live-link-block'
import type { PanelPlan, PanelWords } from './panel-plan'
import { PRINT_TYPE_SCALE } from './print-type-scale'

const TITLE_MAX = 12
/** The QR code and a short measure of words beside it. */
const LIVE_LINK_WIDTH = QR_SIZE + 44
/** Paper between the name and the QR code, and above the legend. */
const BAND_GAP = 8
/** The narrowest legend column whose words still mostly hold on one or two lines. */
const LEGEND_COLUMN_MIN_WIDTH = 56
const LEGEND_COLUMN_MAX_COUNT = 3

const { foot, heading } = PRINT_TYPE_SCALE

/**
 * The printed side as a band under the tree, for a sheet taller than wide:
 * the name and the printed day beside the QR code, the legend across the
 * whole width under them. Its height follows its words.
 */
export const bandPanelPlan = ({
  width,
  words
}: {
  width: number
  words: PanelWords
}): PanelPlan & { height: number } => {
  const nameWidth = words.hasLiveLink
    ? width - LIVE_LINK_WIDTH - BAND_GAP
    : width
  const identity = identityBlock({
    familyName: words.familyName,
    isNameOnOneLine: true,
    summary: words.summary,
    titleMax: TITLE_MAX,
    width: nameWidth
  })
  const live = words.hasLiveLink
    ? liveLinkBlock({ width: LIVE_LINK_WIDTH, words: words.liveWords })
    : null
  const footY = identity.height + foot.size * 2.4
  const topRow = Math.max(footY, live?.height ?? 0)

  const columnCount = Math.min(
    LEGEND_COLUMN_MAX_COUNT,
    Math.max(
      1,
      Math.floor((width + BAND_GAP) / (LEGEND_COLUMN_MIN_WIDTH + BAND_GAP))
    )
  )
  const legend = legendColumns({
    columnCount,
    entries: words.legend,
    width
  })
  const legendY = topRow + BAND_GAP + heading.size

  return {
    foot: { x: 0, y: footY },
    height: legendY + legend.height,
    identity: { ...identity, x: 0, y: 0 },
    legend: { ...legend, width, x: 0, y: legendY },
    liveLink:
      live === null ? null : { ...live, x: width - LIVE_LINK_WIDTH, y: 0 }
  }
}
