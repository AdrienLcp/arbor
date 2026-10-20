import { describe, expect, it } from 'vitest'

import { keepTreeInSight } from './tree-sight'

const tree = { bottom: 400, left: 0, right: 1000, top: 0 }
const sightCentre = { x: 200, y: 300 }

describe('keepTreeInSight', () => {
  it('leaves the tree where it is while it covers the middle of the view', () => {
    const position = { x: -300, y: 100 }

    expect(keepTreeInSight({ position, scale: 1, sightCentre, tree })).toEqual(
      position
    )
  })

  it('stops the left edge at the middle when the tree is dragged right', () => {
    const kept = keepTreeInSight({
      position: { x: 900, y: 100 },
      scale: 1,
      sightCentre,
      tree
    })

    expect(kept.x).toBe(200)
  })

  it('stops the right edge at the middle when the tree is dragged left, at its scale', () => {
    const kept = keepTreeInSight({
      position: { x: -2000, y: 100 },
      scale: 0.5,
      sightCentre,
      tree
    })

    expect(kept.x).toBe(-300)
  })

  it('stops the bottom edge at the middle when the tree is dragged up', () => {
    const kept = keepTreeInSight({
      position: { x: 0, y: -1000 },
      scale: 1,
      sightCentre,
      tree
    })

    expect(kept.y).toBe(-100)
  })
})
