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

  it('[fit-view] fits a tall tree in the full-height column beside a row of tools over the top', () => {
    const fitted = fitView({
      content: { bottom: 1000, left: 0, right: 1000, top: 0 },
      margin: 0,
      maxScale: 2,
      minScale: 0.01,
      overlays: [{ bottom: 50, left: 200, right: 600, top: 0 }],
      view: { bottom: 200, left: 0, right: 600, top: 0 }
    })

    expect(fitted).toEqual({ scale: 0.2, x: 0, y: 0 })
  })

  it('[fit-view] fits a wide tree in the full-width band under a row of tools over the top', () => {
    const fitted = fitView({
      content: { bottom: 600, left: 0, right: 3000, top: 0 },
      margin: 0,
      maxScale: 2,
      minScale: 0.01,
      overlays: [{ bottom: 50, left: 200, right: 600, top: 0 }],
      view: { bottom: 200, left: 0, right: 600, top: 0 }
    })

    expect(fitted).toEqual({ scale: 0.2, x: 0, y: 65 })
  })

  it('[fit-view] keeps its margin from the overlay it fits beside', () => {
    const fitted = fitView({
      content: { bottom: 100, left: 0, right: 100, top: 0 },
      margin: 10,
      maxScale: 2,
      minScale: 0.01,
      overlays: [{ bottom: 120, left: 0, right: 400, top: 0 }],
      view: { bottom: 240, left: 0, right: 400, top: 0 }
    })

    expect(fitted).toEqual({ scale: 1, x: 150, y: 130 })
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
