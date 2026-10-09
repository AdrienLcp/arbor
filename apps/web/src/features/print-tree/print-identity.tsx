import type React from 'react'

import type { IdentityBlock } from './identity-block'
import { PrintLines } from './print-lines'
import { PRINT_PALETTE } from './print-palette'
import { PRINT_TYPE_SCALE } from './print-type-scale'

const { summary, title } = PRINT_TYPE_SCALE

type PrintIdentityProps = {
  block: IdentityBlock
  x: number
  /** The block's top. */
  y: number
}

/** The family's name over what the tree holds, at the head of the printed side. */
export const PrintIdentity: React.FC<PrintIdentityProps> = ({
  block,
  x,
  y
}) => (
  <g>
    <PrintLines
      fill={PRINT_PALETTE.ink}
      leading={block.titleSize * title.leading}
      lines={block.titleLines}
      size={block.titleSize}
      voice='heading'
      x={x}
      y={y + block.titleTop}
    />
    <PrintLines
      fill={PRINT_PALETTE.inkSoft}
      leading={summary.size * summary.leading}
      letterSpacing={summary.tracking}
      lines={block.summaryLines}
      size={summary.size}
      voice='label'
      x={x}
      y={y + block.summaryTop}
    />
  </g>
)
