import { describe, expect, it } from 'vitest'

import { sheetLayout } from './sheet-layout'

const A3_LANDSCAPE = { height: 277, width: 400 }

describe('[print] layout of a printed sheet', () => {
  it('[print] gives the panel a fifth of an A3 and the tree the rest of the width', () => {
    const layout = sheetLayout({
      drawing: A3_LANDSCAPE,
      tree: { height: 1000, width: 3000 }
    })

    expect(layout.panel).toEqual({ height: 277, width: 80, x: 320, y: 0 })
    expect(layout.tree.width).toBeCloseTo(310)
    expect(layout.tree.x).toBeCloseTo(0)
    expect(layout.tree.y).toBeCloseTo((277 - 1000 * (310 / 3000)) / 2)
  })

  it('[print] fits a tall tree to the height and centres it across', () => {
    const layout = sheetLayout({
      drawing: A3_LANDSCAPE,
      tree: { height: 2770, width: 1000 }
    })

    expect(layout.tree.height).toBeCloseTo(277)
    expect(layout.tree.x).toBeCloseTo((310 - 100) / 2)
  })

  it('[print] grows a family to fill a poster, short of swelling a small one', () => {
    const poster = { height: 368, width: 807 }
    const family = sheetLayout({
      drawing: poster,
      tree: { height: 1300, width: 1500 }
    })
    const couple = sheetLayout({
      drawing: poster,
      tree: { height: 300, width: 400 }
    })

    expect(family.tree.height).toBeCloseTo(368)
    expect(couple.tree.scale).toBe(0.6)
    expect(couple.panel.width).toBe(92)
  })

  it('[print] keeps the panel readable on an A4', () => {
    const layout = sheetLayout({
      drawing: { height: 190, width: 277 },
      tree: { height: 100, width: 100 }
    })

    expect(layout.panel.width).toBe(62)
  })
})
