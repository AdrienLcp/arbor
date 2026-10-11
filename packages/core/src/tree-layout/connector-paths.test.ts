import { describe, expect, it } from 'vitest'

import { unionPath } from './connector-paths'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  PARTNER_GAP,
  UNION_WORDS_WIDTH
} from './tree-metrics'

describe('unionPath', () => {
  it('joins neighbours straight across the gap, at mid-card, with their children hanging from its middle', () => {
    const { anchor, points } = unionPath({
      firstLeft: 0,
      secondLeft: CARD_WIDTH + PARTNER_GAP,
      stagger: 0,
      y: 0
    })

    expect(points).toEqual([
      { x: CARD_WIDTH, y: CARD_HEIGHT / 2 },
      { x: CARD_WIDTH + PARTNER_GAP, y: CARD_HEIGHT / 2 }
    ])
    expect(anchor).toEqual({
      x: CARD_WIDTH + PARTNER_GAP / 2,
      y: CARD_HEIGHT / 2
    })
  })

  it('leaves the union line showing on both sides of the widest words pill', () => {
    expect(PARTNER_GAP).toBeGreaterThan(UNION_WORDS_WIDTH)
  })

  it('bridges partners further apart with a bracket over their row', () => {
    const { points } = unionPath({
      firstLeft: 0,
      secondLeft: 2 * (CARD_WIDTH + PARTNER_GAP),
      stagger: 0,
      y: 100
    })

    expect(points).toHaveLength(4)
    expect(points[1]?.y).toBeLessThan(100)
  })
})
