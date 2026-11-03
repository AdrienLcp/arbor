/** A rectangle in the tree's plane or on screen, by its edges. */
export type Box = { bottom: number; left: number; right: number; top: number }

type Fit = { scale: number; x: number; y: number }

const overlaps = (first: Box, second: Box): boolean =>
  first.left < second.right &&
  first.right > second.left &&
  first.top < second.bottom &&
  first.bottom > second.top

const isWithin = (box: Box, view: Box): boolean =>
  box.left >= view.left &&
  box.right <= view.right &&
  box.top >= view.top &&
  box.bottom <= view.bottom &&
  box.left < box.right &&
  box.top < box.bottom

/** The rectangles of `view` no overlay covers, each one bounded by the view's edges or an overlay's: the largest clear parts the content may sit in. */
const clearPartsOf = (view: Box, overlays: readonly Box[]): Box[] => {
  const covering = overlays.filter((overlay) => overlaps(overlay, view))
  if (covering.length === 0) return [view]

  const lefts = [view.left, ...covering.map(({ right }) => right)]
  const rights = [view.right, ...covering.map(({ left }) => left)]
  const tops = [view.top, ...covering.map(({ bottom }) => bottom)]
  const bottoms = [view.bottom, ...covering.map(({ top }) => top)]
  return lefts
    .flatMap((left) =>
      rights.flatMap((right) =>
        tops.flatMap((top) =>
          bottoms.map((bottom) => ({ bottom, left, right, top }))
        )
      )
    )
    .filter(
      (part) =>
        isWithin(part, view) &&
        !covering.some((overlay) => overlaps(overlay, part))
    )
}

const scaleToFill = (content: Box, view: Box, margin: number): number =>
  Math.min(
    Math.max(view.right - view.left - 2 * margin, 1) /
      (content.right - content.left),
    Math.max(view.bottom - view.top - 2 * margin, 1) /
      (content.bottom - content.top)
  )

/** Where the plane goes so `content` sits in the middle of the clear part of `view` where it shows largest, beside or between `overlays`, with `margin` around it, within `minScale` and `maxScale`. */
export const fitView = ({
  content,
  margin,
  maxScale,
  minScale,
  overlays = [],
  view
}: {
  content: Box
  margin: number
  maxScale: number
  minScale: number
  /** What floats over the view, such as a row of tools: the content keeps clear of it. */
  overlays?: readonly Box[]
  view: Box
}): Fit => {
  const [roomiest = view] = clearPartsOf(view, overlays).toSorted(
    (first, second) =>
      scaleToFill(content, second, margin) - scaleToFill(content, first, margin)
  )
  const scale = Math.min(
    maxScale,
    Math.max(minScale, scaleToFill(content, roomiest, margin))
  )

  return {
    scale,
    x:
      (roomiest.left + roomiest.right) / 2 -
      ((content.left + content.right) / 2) * scale,
    y:
      (roomiest.top + roomiest.bottom) / 2 -
      ((content.top + content.bottom) / 2) * scale
  }
}
