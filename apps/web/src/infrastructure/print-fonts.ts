import { Result } from '@adrienlcp/result'

/** A face a printed drawing names by its own family, one family per weight, so a PDF picks the very file the page measured with. */
export type PrintFont = { family: string; url: string }

/** A print face loaded into the page, its file kept for the PDF to embed. */
export type LoadedPrintFont = PrintFont & { base64: string }

const base64Of = (bytes: ArrayBuffer): string => {
  const view = new Uint8Array(bytes)
  let binary = ''
  for (const byte of view) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const loadFont = async (
  font: PrintFont,
  signal: AbortSignal
): Promise<LoadedPrintFont> => {
  const response = await fetch(font.url, { signal })
  if (!response.ok) throw new Error(`${font.url} answered ${response.status}`)
  const bytes = await response.arrayBuffer()
  const face = new FontFace(font.family, bytes)
  document.fonts.add(await face.load())
  return { ...font, base64: base64Of(bytes) }
}

/**
 * Loads the print faces into the page. A drawing is measured and a PDF laid
 * out with the same files: the PDF library reads TrueType only, and places
 * centred text by the width the page measures, so the page must know the
 * faces under the names the drawing uses.
 */
export const loadPrintFonts = async (
  fonts: readonly PrintFont[],
  signal: AbortSignal
): Promise<Result<readonly LoadedPrintFont[], 'fonts_unavailable'>> => {
  try {
    return Result.success(
      await Promise.all(fonts.map((font) => loadFont(font, signal)))
    )
  } catch {
    return Result.failure('fonts_unavailable')
  }
}

let measuringContext: CanvasRenderingContext2D | null = null

/** How wide a line of text is drawn in a loaded face: `family` must be one the page knows. */
export const textWidth = ({
  family,
  size,
  text
}: {
  family: string
  size: number
  text: string
}): number => {
  measuringContext ??= document.createElement('canvas').getContext('2d')
  if (measuringContext === null) return text.length * size * 0.6
  measuringContext.font = `${size}px "${family}"`
  return measuringContext.measureText(text).width
}
