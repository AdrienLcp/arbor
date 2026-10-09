import type { LegendEntry } from './print-legend-entries'
import { wrappedLines } from './print-text'
import { PRINT_TYPE_SCALE } from './print-type-scale'

/** The room a legend sample takes before its words. */
export const LEGEND_SAMPLE_WIDTH = 13
const LEGEND_SAMPLE_GAP = 3.2
/** Paper between two columns of the legend. */
export const LEGEND_COLUMN_GAP = 8

const { heading, text } = PRINT_TYPE_SCALE

export type LegendRow = {
  entry: LegendEntry
  lines: string[]
  /** From the legend heading's baseline to the top of the row. */
  top: number
}

/** A legend set in columns, measured from its heading's baseline. */
export type LegendColumns = {
  columns: LegendRow[][]
  columnWidth: number
  /** From the heading's baseline to the bottom of the longest column. */
  height: number
  textOffset: number
}

const BODY_TOP = heading.size * 0.9
const rowHeight = (lineCount: number) =>
  lineCount * text.size * text.leading + text.size * 0.55

/** The legend wrapped to `width` and spread over `columnCount` columns of even height, entries kept in reading order. */
export const legendColumns = ({
  columnCount,
  entries,
  width
}: {
  columnCount: number
  entries: readonly LegendEntry[]
  width: number
}): LegendColumns => {
  const columnWidth =
    (width - (columnCount - 1) * LEGEND_COLUMN_GAP) / columnCount
  const textOffset = LEGEND_SAMPLE_WIDTH + LEGEND_SAMPLE_GAP
  const measured = entries.map((entry) => {
    const lines = wrappedLines({
      size: text.size,
      text: entry.words,
      voice: 'text',
      width: columnWidth - textOffset
    })
    return { entry, height: rowHeight(lines.length), lines }
  })
  const total = measured.reduce((sum, row) => sum + row.height, 0)
  const target = total / columnCount

  const columns: LegendRow[][] = [[]]
  let y = BODY_TOP
  let height = 0
  for (const { entry, height: rowSize, lines } of measured) {
    const current = columns.at(-1) ?? []
    const isColumnFull =
      current.length > 0 &&
      y - BODY_TOP + rowSize / 2 > target &&
      columns.length < columnCount
    if (isColumnFull) {
      columns.push([])
      y = BODY_TOP
    }
    columns.at(-1)?.push({ entry, lines, top: y + text.size * 0.6 })
    y += rowSize
    height = Math.max(height, y)
  }

  return { columns, columnWidth, height, textOffset }
}
