import type React from 'react'
import { useId } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { PersonFace } from '@/features/family-tree/person-face'
import type { TreeScene } from '@/features/family-tree/tree-scene'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { bandPanelPlan } from './band-panel-plan'
import { columnPanelPlan } from './column-panel-plan'
import type { PanelWords } from './panel-plan'
import { usePrintLegendEntries } from './print-legend-entries'
import type { Size } from './print-pages'
import { PRINT_PALETTE } from './print-palette'
import { PrintPanel } from './print-panel'
import { PrintTreeDrawing } from './print-tree-drawing'
import { isTallSheet, sheetLayout } from './sheet-layout'

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
  const translate = useTranslate()
  const words: PanelWords = {
    familyName,
    hasLiveLink: liveLink !== null,
    legend: usePrintLegendEntries(),
    liveWords: translate('print.live.text'),
    summary
  }
  const band = isTallSheet(drawing)
    ? bandPanelPlan({ width: drawing.width, words })
    : null
  const layout = sheetLayout({
    bandHeight: band?.height ?? null,
    drawing,
    tree: { height: scene.height, width: scene.width }
  })
  const { tree } = layout
  const plan = band ?? columnPanelPlan({ panel: layout.panel, words })

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
        liveLink={liveLink}
        panel={layout.panel}
        plan={plan}
        printedOn={printedOn}
        treeScale={tree.scale}
      />
    </svg>
  )
}
