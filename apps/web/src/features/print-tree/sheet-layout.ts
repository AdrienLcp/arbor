import type { Rect, Size } from './print-pages'

/** The side panel's share of the sheet's width, held between a floor and a ceiling so its words keep their printed size. */
const PANEL_SHARE = 0.2
const PANEL_MIN_WIDTH = 62
const PANEL_MAX_WIDTH = 92
/** Paper between the tree and the panel. */
const PANEL_GAP = 10
/**
 * The largest a tree is printed, in millimetres per pixel of the screen
 * drawing: a sticker 67 mm wide, the size of a photo print. A family of three
 * stays a family of three instead of swelling to fill a poster.
 */
const MAX_TREE_SCALE = 0.6

/** Where the parts of a printed sheet sit, millimetres on the drawing. */
export type SheetLayout = {
  panel: Rect
  /** The tree's box once scaled, and the scale from screen pixels to millimetres. */
  tree: Rect & { scale: number }
}

/** A sheet taller than wide carries its panel as a band under the tree: a side column would squeeze the tree into a strip. */
export const isTallSheet = (drawing: Size): boolean =>
  drawing.height > drawing.width

const panelRect = ({
  bandHeight,
  drawing
}: {
  bandHeight: number | null
  drawing: Size
}): Rect => {
  if (bandHeight !== null) {
    return {
      height: bandHeight,
      width: drawing.width,
      x: 0,
      y: drawing.height - bandHeight
    }
  }
  const width = Math.min(
    PANEL_MAX_WIDTH,
    Math.max(PANEL_MIN_WIDTH, drawing.width * PANEL_SHARE)
  )
  return { height: drawing.height, width, x: drawing.width - width, y: 0 }
}

/** Lays the tree and its panel out on a drawing of a given size: the tree as large as fits, centred in the room the panel leaves. */
export const sheetLayout = ({
  bandHeight,
  drawing,
  tree
}: {
  /** The band's height under the tree, or `null` for a side column. */
  bandHeight: number | null
  drawing: Size
  /** The tree drawing's natural size, in screen pixels. */
  tree: Size
}): SheetLayout => {
  const panel = panelRect({ bandHeight, drawing })
  const room =
    bandHeight === null
      ? {
          height: drawing.height,
          width: drawing.width - panel.width - PANEL_GAP
        }
      : {
          height: drawing.height - panel.height - PANEL_GAP,
          width: drawing.width
        }
  const scale =
    tree.width === 0 || tree.height === 0
      ? MAX_TREE_SCALE
      : Math.min(
          MAX_TREE_SCALE,
          room.width / tree.width,
          room.height / tree.height
        )
  const width = tree.width * scale
  const height = tree.height * scale

  return {
    panel,
    tree: {
      height,
      scale,
      width,
      x: (room.width - width) / 2,
      y: (room.height - height) / 2
    }
  }
}
