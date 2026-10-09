import { Result } from '@adrienlcp/result'

import type { LoadedPrintFont } from './print-fonts'

/** The resolution of a PNG: sharp on a phone held close, light enough to send in a message. */
const PNG_DOTS_PER_INCH = 150
const MILLIMETRES_PER_INCH = 25.4
/** Past this side, some browsers hand back an empty canvas. */
const MAX_CANVAS_SIDE = 8000

type DrawingFile = {
  fonts: readonly LoadedPrintFont[]
  svg: SVGSVGElement
}

const fontFaceOf = (font: LoadedPrintFont): string =>
  `@font-face{font-family:"${font.family}";src:url(data:font/ttf;base64,${font.base64}) format("truetype")}`

/**
 * The drawing as a standalone SVG file: the page's classes dropped, the faces
 * it names carried inside, so it opens the same in any viewer.
 */
export const svgFileOfDrawing = ({ fonts, svg }: DrawingFile): Blob => {
  const copy = svg.cloneNode(true)
  if (copy instanceof SVGSVGElement) {
    copy.removeAttribute('class')
    copy.removeAttribute('aria-hidden')
    const style = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style'
    )
    style.textContent = fonts.map(fontFaceOf).join('')
    copy.prepend(style)
  }
  return new Blob([new XMLSerializer().serializeToString(copy)], {
    type: 'image/svg+xml'
  })
}

const imageOf = async (file: Blob): Promise<HTMLImageElement> => {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** The drawing as a PNG picture at print resolution, its size on paper given in millimetres. */
export const pngFileOfDrawing = async ({
  drawingSize,
  ...drawing
}: DrawingFile & {
  drawingSize: { height: number; width: number }
}): Promise<Result<Blob, 'png_failed'>> => {
  try {
    const image = await imageOf(svgFileOfDrawing(drawing))
    const scale = Math.min(
      PNG_DOTS_PER_INCH / MILLIMETRES_PER_INCH,
      MAX_CANVAS_SIDE / Math.max(drawingSize.width, drawingSize.height)
    )
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(drawingSize.width * scale)
    canvas.height = Math.round(drawingSize.height * scale)
    const context = canvas.getContext('2d')
    if (context === null) return Result.failure('png_failed')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const png = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    return png === null ? Result.failure('png_failed') : Result.success(png)
  } catch {
    return Result.failure('png_failed')
  }
}
