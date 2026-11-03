import { describe, expect, it } from 'vitest'

import { keepTreeInSight } from './tree-sight'

const tree = { bottom: 400, left: 0, right: 1000, top: 0 }
const sight = { bottom: 600, left: 0, right: 400, top: 0 }
const smallTree = { bottom: 100, left: 0, right: 100, top: 0 }

describe('keepTreeInSight', () => {
  it('leaves the tree where it is while it covers the middle of the view', () => {
    const position = { x: -300, y: 100 }

    expect(keepTreeInSight({ position, scale: 1, sight, tree })).toEqual(
      position
    )
  })

  it('stops the left edge at the middle when the tree is dragged right', () => {
    const kept = keepTreeInSight({
      position: { x: 900, y: 100 },
      scale: 1,
      sight,
      tree
    })

    expect(kept.x).toBe(200)
  })

  it('stops the right edge at the middle when the tree is dragged left, at its scale', () => {
    const kept = keepTreeInSight({
      position: { x: -2000, y: 100 },
      scale: 0.5,
      sight,
      tree
    })

    expect(kept.x).toBe(-300)
  })

  it('stops the bottom edge at the middle when the tree is dragged up', () => {
    const kept = keepTreeInSight({
      position: { x: 0, y: -1000 },
      scale: 1,
      sight,
      tree
    })

    expect(kept.y).toBe(-100)
  })

  it('[tree-sight] leaves a tree smaller than the view wherever it sits whole in sight, off the middle', () => {
    const position = { x: 10, y: 480 }

    expect(
      keepTreeInSight({ position, scale: 1, sight, tree: smallTree })
    ).toEqual(position)
  })

  it('[tree-sight] stops a tree smaller than the view at the edge of what is in sight', () => {
    const kept = keepTreeInSight({
      position: { x: -50, y: 700 },
      scale: 1,
      sight,
      tree: smallTree
    })

    expect(kept).toEqual({ x: 0, y: 500 })
  })
})
