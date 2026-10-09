/** Millimetres, the unit of everything on paper. */
export type Size = { height: number; width: number }
export type Rect = Size & { x: number; y: number }
export type Segment = {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

export type Orientation = 'landscape' | 'portrait'

/** ISO sizes, portrait. A4 and A3 go through a home printer; A2 and A1 are for a print shop. */
export const PAPER_SIZES = {
  a1: { height: 841, width: 594 },
  a2: { height: 594, width: 420 },
  a3: { height: 420, width: 297 },
  a4: { height: 297, width: 210 }
} as const satisfies Record<string, Size>
export type PaperSize = keyof typeof PAPER_SIZES

/** One sheet of paper, or a poster tiled over several A4 sheets glued together. */
export type PrintFormat =
  | { kind: 'sheet'; orientation: Orientation; paper: PaperSize }
  | { columns: number; kind: 'poster'; orientation: Orientation; rows: number }

/** The blank edge a home printer leaves, kept clear of the drawing on every page. */
export const PAGE_MARGIN = 10
/** How much of a poster tile repeats on its neighbour: the strip glued under it. */
export const POSTER_OVERLAP = 12
/** How long an assembly mark is, drawn in the margin. */
const MARK_LENGTH = 6

export type PrintPage = {
  /** The part of the drawing this page carries, in drawing millimetres. */
  area: Rect
  /** Short marks in the margin: where to cut this sheet, and where the next one is glued. */
  marks: { cut: readonly Segment[]; glue: readonly Segment[] }
  size: Size
  /** Where a poster tile sits in the assembly, counted from 1; `null` for a single sheet. */
  tile: { column: number; row: number } | null
  /** Where `area` is printed on the page. */
  window: Rect
}

/** The drawing's size on paper, and the pages that carry it. */
export type PrintPlan = { drawing: Size; pages: readonly PrintPage[] }

const oriented = (size: Size, orientation: Orientation): Size => {
  const long = Math.max(size.width, size.height)
  const short = Math.min(size.width, size.height)
  return orientation === 'landscape'
    ? { height: short, width: long }
    : { height: long, width: short }
}

const inside = (size: Size): Rect => ({
  height: size.height - 2 * PAGE_MARGIN,
  width: size.width - 2 * PAGE_MARGIN,
  x: PAGE_MARGIN,
  y: PAGE_MARGIN
})

/** A pair of marks across the margins, top and bottom, at `x` on the page. */
const verticalMarks = (x: number, page: Size): Segment[] => [
  {
    from: { x, y: PAGE_MARGIN - MARK_LENGTH - 1 },
    to: { x, y: PAGE_MARGIN - 1 }
  },
  {
    from: { x, y: page.height - PAGE_MARGIN + 1 },
    to: { x, y: page.height - PAGE_MARGIN + MARK_LENGTH + 1 }
  }
]

/** A pair of marks across the margins, left and right, at `y` on the page. */
const horizontalMarks = (y: number, page: Size): Segment[] => [
  {
    from: { x: PAGE_MARGIN - MARK_LENGTH - 1, y },
    to: { x: PAGE_MARGIN - 1, y }
  },
  {
    from: { x: page.width - PAGE_MARGIN + 1, y },
    to: { x: page.width - PAGE_MARGIN + MARK_LENGTH + 1, y }
  }
]

const posterPlan = ({
  columns,
  orientation,
  rows
}: {
  columns: number
  orientation: Orientation
  rows: number
}): PrintPlan => {
  const size = oriented(PAPER_SIZES.a4, orientation)
  const window = inside(size)
  const stepX = window.width - POSTER_OVERLAP
  const stepY = window.height - POSTER_OVERLAP

  const pages = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (__, column): PrintPage => {
      const hasLeft = column > 0
      const hasAbove = row > 0
      const hasRight = column < columns - 1
      const hasBelow = row < rows - 1

      return {
        area: {
          height: window.height,
          width: window.width,
          x: column * stepX,
          y: row * stepY
        },
        marks: {
          cut: [
            ...(hasLeft ? verticalMarks(window.x, size) : []),
            ...(hasAbove ? horizontalMarks(window.y, size) : [])
          ],
          glue: [
            ...(hasRight ? verticalMarks(window.x + stepX, size) : []),
            ...(hasBelow ? horizontalMarks(window.y + stepY, size) : [])
          ]
        },
        size,
        tile: { column: column + 1, row: row + 1 },
        window
      }
    })
  ).flat()

  return {
    drawing: {
      height: rows * stepY + POSTER_OVERLAP,
      width: columns * stepX + POSTER_OVERLAP
    },
    pages
  }
}

/** How a format lays the drawing out on paper: a single page, or a poster's tiles left to right, top to bottom. */
export const printPlan = (format: PrintFormat): PrintPlan => {
  if (format.kind === 'poster') {
    return posterPlan(format)
  }

  const size = oriented(PAPER_SIZES[format.paper], format.orientation)
  const window = inside(size)

  return {
    drawing: { height: window.height, width: window.width },
    pages: [
      {
        area: { ...window, x: 0, y: 0 },
        marks: { cut: [], glue: [] },
        size,
        tile: null,
        window
      }
    ]
  }
}
