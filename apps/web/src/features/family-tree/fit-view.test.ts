import { describe, expect, it } from 'vitest'

import { fitView } from './fit-view'

const wholeScreen = { bottom: 600, left: 0, right: 400, top: 0 }

describe('fitView', () => {
  it('shrinks a wide tree to the width left beside the controls, centred in it', () => {
    const fitted = fitView({
      content: { bottom: 100, left: 0, right: 1000, top: 0 },
      margin: 0,
      maxScale: 2,
      minScale: 0.1,
      view: { ...wholeScreen, right: 300 }
    })

    expect(fitted).toEqual({ scale: 0.3, x: 0, y: 285 })
  })

  it('keeps a tall tree above a sheet covering the bottom half', () => {
    const fitted = fitView({
      content: { bottom: 1200, left: 0, right: 100, top: 0 },
      margin: 0,
      maxScale: 2,
      minScale: 0.1,
      view: { ...wholeScreen, bottom: 300 }
    })

    expect(fitted.scale).toBe(0.25)
    expect(fitted.y).toBe(0)
  })

  it('never zooms past the limits', () => {
    const tiny = fitView({
      content: { bottom: 10, left: 0, right: 10, top: 0 },
      margin: 0,
      maxScale: 1,
      minScale: 0.1,
      view: wholeScreen
    })

    expect(tiny.scale).toBe(1)
  })
})
