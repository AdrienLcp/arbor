/** A rectangle in the tree's plane or on screen, by its edges. */
export type Box = { bottom: number; left: number; right: number; top: number }

/** Where the plane goes so `content` sits in the middle of `view`, as large as fits with `margin` around it, within `minScale` and `maxScale`. */
export const fitView = ({
  content,
  margin,
  maxScale,
  minScale,
  view
}: {
  content: Box
  margin: number
  maxScale: number
  minScale: number
  view: Box
}): { scale: number; x: number; y: number } => {
  const viewWidth = Math.max(view.right - view.left - 2 * margin, 1)
  const viewHeight = Math.max(view.bottom - view.top - 2 * margin, 1)
  const scale = Math.min(
    maxScale,
    Math.max(
      minScale,
      Math.min(
        viewWidth / (content.right - content.left),
        viewHeight / (content.bottom - content.top)
      )
    )
  )

  return {
    scale,
    x:
      (view.left + view.right) / 2 -
      ((content.left + content.right) / 2) * scale,
    y:
      (view.top + view.bottom) / 2 -
      ((content.top + content.bottom) / 2) * scale
  }
}
