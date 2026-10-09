import type { DemoPhotoFiles } from '@/domain/demo/open-demo-family'

import weddingFull from './auguste-marie-wedding-full.webp'
import weddingThumbnail from './auguste-marie-wedding-thumbnail.webp'
import portraitFull from './auguste-portrait-full.webp'
import portraitThumbnail from './auguste-portrait-thumbnail.webp'

/** The images of the demo family's two photos, bundled with the worker (sources in `README.md`). */
export const DEMO_PHOTO_FILES: DemoPhotoFiles = {
  'auguste-marie-wedding': {
    full: new Uint8Array(weddingFull),
    thumbnail: new Uint8Array(weddingThumbnail)
  },
  'auguste-portrait': {
    full: new Uint8Array(portraitFull),
    thumbnail: new Uint8Array(portraitThumbnail)
  }
}
