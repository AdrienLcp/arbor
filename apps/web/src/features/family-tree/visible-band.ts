import type { Box } from './fit-view'

/** The part of the canvas a phone's bottom sheet leaves in sight: its height, and how far its middle sits from the canvas's middle. */
export type VisibleBand = {
  centreOffset: number
  height: number
}

type CanvasBox = Pick<DOMRect, 'bottom' | 'height' | 'top'>

/** The canvas between the top of the window and the edge of a sheet covering `coveredBottomShare` of the window's height. */
export const visibleBandOf = ({
  canvas,
  coveredBottomShare,
  windowHeight
}: {
  canvas: CanvasBox
  coveredBottomShare: number
  windowHeight: number
}): VisibleBand => {
  const bandTop = Math.max(canvas.top, 0)
  const bandBottom = Math.min(
    canvas.bottom,
    windowHeight * (1 - coveredBottomShare)
  )
  const height = Math.max(bandBottom - bandTop, 0)

  return {
    centreOffset: bandTop + height / 2 - (canvas.top + canvas.height / 2),
    height
  }
}

/** The band as a box on the canvas, measured from the canvas's top left corner. */
export const boxOfBand = (
  canvas: Pick<DOMRect, 'height' | 'width'>,
  band: VisibleBand
): Box => {
  const top = canvas.height / 2 + band.centreOffset - band.height / 2
  return { bottom: top + band.height, left: 0, right: canvas.width, top }
}
