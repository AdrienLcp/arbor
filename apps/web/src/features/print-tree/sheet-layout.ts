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

/** Lays the tree and its side panel out on a drawing of a given size: the tree as large as fits, centred in its room. */
export const sheetLayout = ({
  drawing,
  tree
}: {
  drawing: Size
  /** The tree drawing's natural size, in screen pixels. */
  tree: Size
}): SheetLayout => {
  const panelWidth = Math.min(
    PANEL_MAX_WIDTH,
    Math.max(PANEL_MIN_WIDTH, drawing.width * PANEL_SHARE)
  )
  const room = {
    height: drawing.height,
    width: drawing.width - panelWidth - PANEL_GAP
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
    panel: {
      height: drawing.height,
      width: panelWidth,
      x: drawing.width - panelWidth,
      y: 0
    },
    tree: {
      height,
      scale,
      width,
      x: (room.width - width) / 2,
      y: (room.height - height) / 2
    }
  }
}
