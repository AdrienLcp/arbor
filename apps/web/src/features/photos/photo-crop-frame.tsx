import type React from 'react'
import { ReactCrop } from 'react-image-crop'

import { useTranslate } from '@/presentation/i18n/i18n-context'

import type { PhotoCrop } from './photo-resize'

import 'react-image-crop/dist/ReactCrop.css'
import './photo-crop-frame.sass'

type PhotoCropFrameProps = {
  crop: PhotoCrop
  onChange: (crop: PhotoCrop) => void
  /** The upright picture the frame lies over. */
  previewUrl: string
}

const PERCENT = 100
/** The smallest side of the frame, in pixels: two handles' width, so its corners never cover each other. */
const MIN_FRAME_SIDE = 96

/** A picked picture under a frame whose corners and edges pull in, to keep only part of it. */
export const PhotoCropFrame: React.FC<PhotoCropFrameProps> = ({
  crop,
  onChange,
  previewUrl
}) => {
  const translate = useTranslate()
  const handle = translate('photos.crop.handle')

  return (
    <ReactCrop
      ariaLabels={{
        cropArea: translate('photos.crop.area'),
        eDragHandle: handle,
        nDragHandle: handle,
        neDragHandle: handle,
        nwDragHandle: handle,
        sDragHandle: handle,
        seDragHandle: handle,
        swDragHandle: handle,
        wDragHandle: handle
      }}
      className='photo-crop-frame'
      crop={{
        height: crop.height * PERCENT,
        unit: '%',
        width: crop.width * PERCENT,
        x: crop.x * PERCENT,
        y: crop.y * PERCENT
      }}
      // A touch outside the frame would otherwise drop it, and the crop with it.
      keepSelection
      minHeight={MIN_FRAME_SIDE}
      minWidth={MIN_FRAME_SIDE}
      onChange={(_pixels, percent) =>
        onChange({
          height: percent.height / PERCENT,
          width: percent.width / PERCENT,
          x: percent.x / PERCENT,
          y: percent.y / PERCENT
        })
      }
      ruleOfThirds
    >
      <img alt='' className='photo-crop-image' src={previewUrl} />
    </ReactCrop>
  )
}
