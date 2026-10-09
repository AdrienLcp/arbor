import type React from 'react'

import type { PanelPlan } from './panel-plan'
import { PrintIdentity } from './print-identity'
import { PrintLegend } from './print-legend'
import { PrintLiveLink } from './print-live-link'
import type { Rect } from './print-pages'
import { PrintPrintedOn } from './print-printed-on'

type PrintPanelProps = {
  /** The link the QR code opens: the reader link, never the family link; `null` prints no code. */
  liveLink: string | null
  panel: Rect
  plan: PanelPlan
  printedOn: Temporal.PlainDate
  /** Millimetres per screen pixel of the tree, so the legend's lines are the tree's own. */
  treeScale: number
}

/** The sheet's printed side: the family's name, what the tree holds, the legend every printed sheet carries, the way back to the live tree. */
export const PrintPanel: React.FC<PrintPanelProps> = ({
  liveLink,
  panel,
  plan,
  printedOn,
  treeScale
}) => (
  <g transform={`translate(${panel.x} ${panel.y})`}>
    <PrintIdentity
      block={plan.identity}
      x={plan.identity.x}
      y={plan.identity.y}
    />
    <PrintLegend
      legend={plan.legend}
      treeScale={treeScale}
      width={plan.legend.width}
      x={plan.legend.x}
      y={plan.legend.y}
    />
    {liveLink === null || plan.liveLink === null ? null : (
      <PrintLiveLink
        block={plan.liveLink}
        link={liveLink}
        x={plan.liveLink.x}
        y={plan.liveLink.y}
      />
    )}
    <PrintPrintedOn day={printedOn} x={plan.foot.x} y={plan.foot.y} />
  </g>
)
