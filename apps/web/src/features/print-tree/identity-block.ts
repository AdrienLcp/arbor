import { fittedSize, wrappedLines } from './print-text'
import { PRINT_TYPE_SCALE } from './print-type-scale'

const { summary: summaryType, title } = PRINT_TYPE_SCALE

/** The family's name and what the tree holds, measured from the block's top. */
export type IdentityBlock = {
  /** From the block's top to the bottom of the summary. */
  height: number
  summaryLines: string[]
  summaryTop: number
  titleLines: string[]
  titleSize: number
  titleTop: number
}

/**
 * The family's name set as large as `width` allows up to `titleMax`, then the
 * summary wrapped under it. A narrow column gives each word of the name its
 * own line; a wide band keeps the name on one.
 */
export const identityBlock = ({
  familyName,
  isNameOnOneLine,
  summary,
  titleMax,
  width
}: {
  familyName: string
  isNameOnOneLine: boolean
  summary: string
  titleMax: number
  width: number
}): IdentityBlock => {
  const name = familyName.toLocaleUpperCase()
  const titleLines = isNameOnOneLine ? [name] : name.split(/\s+/)
  const titleSize = Math.min(
    ...titleLines.map((line) =>
      fittedSize({
        size: titleMax,
        smallest: title.smallest,
        text: line,
        voice: 'heading',
        width
      })
    )
  )
  const titleTop = titleSize * 0.8
  const summaryTop =
    titleTop +
    (titleLines.length - 1) * titleSize * title.leading +
    summaryType.size * 2
  const summaryLines = wrappedLines({
    size: summaryType.size,
    text: summary.toLocaleUpperCase(),
    tracking: summaryType.tracking,
    voice: 'label',
    width
  })
  return {
    height:
      summaryTop + summaryLines.length * summaryType.size * summaryType.leading,
    summaryLines,
    summaryTop,
    titleLines,
    titleSize,
    titleTop
  }
}
