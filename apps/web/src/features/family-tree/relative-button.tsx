import type React from 'react'
import { ViewTransition } from 'react'
import { Button } from 'react-aria-components'

import { PortraitImage } from '@/features/photos/portrait-image'
import { MiniSticker } from '@/presentation/components/mini-sticker'

import type { LineStyle } from './line-style'
import { LineSwatch } from './line-swatch'
import type { PersonFace } from './person-face'

import './relative-button.sass'

type RelativeButtonProps = {
  face: PersonFace
  /**
   * Lets the sticker slide into its new place when the page turns. Off where
   * a person may be listed twice: two stickers cannot share one name.
   */
  isMorphing?: boolean
  /** Read under the name: what they are to the page's person, or their years. */
  lines: readonly string[]
  onPress: () => void
  /** The stroke of the link that ties them to the page's person, drawn before the first line. */
  swatch?: LineStyle
}

/** A relative as one line of a page: their small sticker and name; touching it turns the page to them. */
export const RelativeButton: React.FC<RelativeButtonProps> = ({
  face,
  isMorphing = true,
  lines,
  onPress,
  swatch
}) => {
  const sticker = (
    <MiniSticker
      generation={face.generation}
      isDeceased={face.isDeceased}
      monogram={face.monogram}
      portrait={<PortraitImage photoId={face.portraitPhotoId} />}
    />
  )

  return (
    <Button className='relative-button' onPress={onPress}>
      {isMorphing ? (
        <ViewTransition name={`person-${face.id}`}>{sticker}</ViewTransition>
      ) : (
        sticker
      )}
      <span className='relative-button-text'>
        <span className='relative-button-name'>{face.name}</span>
        {lines.map((line, index) => (
          <span className='relative-button-line' key={line}>
            {index === 0 && swatch !== undefined ? (
              <LineSwatch height={12} style={swatch} width={26} />
            ) : null}
            {line}
          </span>
        ))}
      </span>
    </Button>
  )
}
