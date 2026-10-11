import { describe, expect, it } from 'vitest'

import { visibleBandOf } from './visible-band'

describe('visibleBandOf', () => {
  it('is the whole canvas when nothing covers it', () => {
    expect(
      visibleBandOf({
        canvas: { bottom: 740, height: 460, top: 280 },
        coveredBottomShare: 0,
        windowHeight: 740
      })
    ).toEqual({ centreOffset: 0, height: 460 })
  })

  it('is the strip between the canvas top and a half-open sheet, its middle raised above the canvas middle', () => {
    expect(
      visibleBandOf({
        canvas: { bottom: 740, height: 460, top: 280 },
        coveredBottomShare: 0.5,
        windowHeight: 740
      })
    ).toEqual({ centreOffset: -185, height: 90 })
  })

  it('is empty when the sheet rises above the canvas', () => {
    expect(
      visibleBandOf({
        canvas: { bottom: 740, height: 200, top: 540 },
        coveredBottomShare: 0.5,
        windowHeight: 740
      }).height
    ).toBe(0)
  })
})
