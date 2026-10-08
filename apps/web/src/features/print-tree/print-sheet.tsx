import type React from 'react'
import { useId } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import type { TreeScene } from '@/features/family-tree/tree-scene'

import type { Size } from './print-pages'
import { PRINT_PALETTE } from './print-palette'
import { PrintPanel } from './print-panel'
import { PrintTreeDrawing } from './print-tree-drawing'
import { sheetLayout } from './sheet-layout'

export type PrintSheetProps = {
  className?: string
  /** The drawing's size on paper, in millimetres: the SVG's own units. */
  drawing: Size
  faces: ReadonlyMap<EntityId, PersonFace>
  familyName: string
  /** The link the QR code opens; `null` prints no code. */
  liveLink: string | null
  printedOn: Temporal.PlainDate
  /** Receives the SVG element, which the PDF is made from. */
  ref?: React.Ref<SVGSVGElement>
  scene: TreeScene
  slotNumbers: ReadonlyMap<string, number>
  summary: string
}

/**
 * The printed tree: one vector drawing, in millimetres, on the forced light
 * palette with pure-white paper. The same element is the preview on screen
 * and the source of the PDF, so what is seen is what prints.
 */
export const PrintSheet: React.FC<PrintSheetProps> = ({
  className,
  drawing,
  faces,
  familyName,
  liveLink,
  printedOn,
  ref,
  scene,
  slotNumbers,
  summary
}) => {
  const idPrefix = `print${useId().replaceAll(':', '')}`
  const layout = sheetLayout({
    drawing,
    tree: { height: scene.height, width: scene.width }
  })
  const { tree } = layout

  return (
    <svg
      aria-hidden='true'
      className={className}
      height={`${drawing.height}mm`}
      ref={ref}
      viewBox={`0 0 ${drawing.width} ${drawing.height}`}
      width={`${drawing.width}mm`}
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect
        fill={PRINT_PALETTE.paper}
        height={drawing.height}
        width={drawing.width}
      />
      <g
        transform={`translate(${tree.x} ${tree.y}) scale(${tree.scale}) translate(${-scene.origin.x} ${-scene.origin.y})`}
      >
        <PrintTreeDrawing
          faces={faces}
          idPrefix={idPrefix}
          scene={scene}
          slotNumbers={slotNumbers}
        />
      </g>
      <PrintPanel
        familyName={familyName}
        liveLink={liveLink}
        panel={layout.panel}
        printedOn={printedOn}
        summary={summary}
        treeScale={tree.scale}
      />
    </svg>
  )
}
