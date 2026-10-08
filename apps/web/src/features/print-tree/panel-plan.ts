import type { IdentityBlock } from './identity-block'
import type { LegendColumns } from './legend-columns'
import type { LiveLinkBlock } from './live-link-block'
import type { LegendEntry } from './print-legend-entries'

type Point = { x: number; y: number }

/** What the printed side says, before it is laid out. */
export type PanelWords = {
  familyName: string
  hasLiveLink: boolean
  legend: readonly LegendEntry[]
  liveWords: string
  summary: string
}

/** Where each part of the printed side sits, millimetres from the panel's top-left corner. */
export type PanelPlan = {
  /** The printed day's baseline. */
  foot: Point
  identity: IdentityBlock & Point
  /** At the legend heading's baseline. */
  legend: LegendColumns & Point & { width: number }
  liveLink: (LiveLinkBlock & Point) | null
}
