import { classNames } from '@adrienlcp/react'
import type React from 'react'

import './album-glyph.sass'

type AlbumGlyphProps = {
  /** Drawn white on the vermilion cover rather than vermilion on paper. */
  isOnCover?: boolean
}

/** The small closed album that stands for Arbor beside a family's name. Decorative. */
export const AlbumGlyph: React.FC<AlbumGlyphProps> = ({
  isOnCover = false
}) => (
  <span
    aria-hidden='true'
    className={classNames('album-glyph', isOnCover && 'on-cover')}
  />
)
