import { Result } from '@adrienlcp/result'

import type { LoadedPrintFont } from './print-fonts'

/** Millimetres. */
type Size = { height: number; width: number }
type Rect = Size & { x: number; y: number }
type Segment = { from: { x: number; y: number }; to: { x: number; y: number } }

/** One page of the PDF: the part of the drawing it shows, where, and what is printed in its margins. */
export type PdfPage = {
  area: Rect
  /** Words in the bottom margin: which tile of a poster it is. */
  label: string | null
  marks: { cut: readonly Segment[]; glue: readonly Segment[] }
  size: Size
  window: Rect
}

/** How the marks in a poster's margins are drawn: thin, in the drawing's ink. */
const MARK_WIDTH = 0.25
const GLUE_DASH = [1.2, 1]
/** The tile's name in its bottom margin, in points. */
const LABEL_SIZE = 8
const LABEL_BASELINE_FROM_BOTTOM = 4
/** Clear of the cut mark that runs down the window's left edge. */
const LABEL_INSET = 4

type PdfDrawing = {
  /** The drawing's size on paper, millimetres: the SVG is stretched to it. */
  drawingSize: Size
  fonts: readonly LoadedPrintFont[]
  /** The face of the words printed in the margins, one of `fonts`. */
  labelFamily: string
  /** The colour of the margin marks and words, as a hex colour. */
  markColor: string
  pages: readonly PdfPage[]
  svg: SVGSVGElement
}

/**
 * Turns a drawing into a PDF, one page per print page: each page shows its
 * part of the drawing inside its window, clipped, so a poster's tiles are the
 * same vector drawing cut in pieces. The fonts are embedded.
 */
export const pdfOfDrawing = async ({
  drawingSize,
  fonts,
  labelFamily,
  markColor,
  pages,
  svg
}: PdfDrawing): Promise<Result<Blob, 'pdf_failed'>> => {
  try {
    const [{ jsPDF }, { svg2pdf }] = await Promise.all([
      import('jspdf'),
      import('svg2pdf.js')
    ])
    const [first, ...rest] = pages
    if (first === undefined) return Result.failure('pdf_failed')

    const orientationOf = (size: Size) =>
      size.width > size.height ? 'landscape' : 'portrait'
    const document = new jsPDF({
      format: [first.size.width, first.size.height],
      orientation: orientationOf(first.size),
      unit: 'mm'
    })
    for (const font of fonts) {
      const file = `${font.family}.ttf`
      document.addFileToVFS(file, font.base64)
      document.addFont(file, font.family, 'normal')
    }

    const drawMark = ({ from, to }: Segment) =>
      document.line(from.x, from.y, to.x, to.y)

    for (const page of [first, ...rest]) {
      if (page !== first) {
        document.addPage(
          [page.size.width, page.size.height],
          orientationOf(page.size)
        )
      }
      const { window } = page
      document.saveGraphicsState()
      document.rect(window.x, window.y, window.width, window.height, null)
      document.clip()
      document.discardPath()
      await svg2pdf(svg, document, {
        height: drawingSize.height,
        width: drawingSize.width,
        x: window.x - page.area.x,
        y: window.y - page.area.y
      })
      document.restoreGraphicsState()

      document.setDrawColor(markColor)
      document.setLineWidth(MARK_WIDTH)
      page.marks.cut.forEach(drawMark)
      document.setLineDashPattern(GLUE_DASH, 0)
      page.marks.glue.forEach(drawMark)
      document.setLineDashPattern([], 0)

      if (page.label !== null) {
        document.setFont(labelFamily, 'normal')
        document.setFontSize(LABEL_SIZE)
        document.setTextColor(markColor)
        document.text(
          page.label,
          window.x + LABEL_INSET,
          page.size.height - LABEL_BASELINE_FROM_BOTTOM
        )
      }
    }

    return Result.success(document.output('blob'))
  } catch {
    return Result.failure('pdf_failed')
  }
}
