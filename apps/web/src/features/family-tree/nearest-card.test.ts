import { describe, expect, it } from 'vitest'

import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'

import { arrowDirectionOf, nearestCardToward } from './nearest-card'

const card = (key: string, { x, y }: { x: number; y: number }): TreeCard => ({
  generation: 1,
  key,
  kind: 'unknown-parent',
  x,
  y
})

const GRANDMOTHER = card('grandmother', { x: 300, y: 0 })
const AUNT = card('aunt', { x: 0, y: 280 })
const MOTHER = card('mother', { x: 400, y: 280 })
const FATHER = card('father', { x: 560, y: 280 })
const CHILD = card('child', { x: 900, y: 560 })
const CARDS = [GRANDMOTHER, AUNT, MOTHER, FATHER, CHILD]

const keyToward = (
  from: TreeCard,
  direction: Parameters<typeof nearestCardToward>[0]['direction']
) => nearestCardToward({ cards: CARDS, direction, from })?.key ?? null

describe('nearestCardToward', () => {
  it('[nearest-card] moves to the closest card on the same row', () => {
    expect(keyToward(MOTHER, 'right')).toBe('father')
    expect(keyToward(MOTHER, 'left')).toBe('aunt')
  })

  it('[nearest-card] stays on the row at its end rather than jumping to another', () => {
    expect(keyToward(FATHER, 'right')).toBeNull()
  })

  it('[nearest-card] goes up or down to the nearest row, then to the card most in line', () => {
    expect(keyToward(MOTHER, 'up')).toBe('grandmother')
    expect(keyToward(GRANDMOTHER, 'down')).toBe('mother')
    expect(keyToward(CHILD, 'up')).toBe('father')
  })

  it('[nearest-card] finds nothing past the last row', () => {
    expect(keyToward(CHILD, 'down')).toBeNull()
  })
})

describe('arrowDirectionOf', () => {
  it('[nearest-card] reads the four arrows and nothing else', () => {
    expect(arrowDirectionOf('ArrowUp')).toBe('up')
    expect(arrowDirectionOf('ArrowLeft')).toBe('left')
    expect(arrowDirectionOf('Enter')).toBeNull()
    expect(arrowDirectionOf('toString')).toBeNull()
  })
})
