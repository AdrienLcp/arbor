import { describe, expect, it } from 'vitest'

import type { Filiation, FiliationKind } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

import { lineStyleOf } from './line-style'

const POINTS = [
  { x: 0, y: 0 },
  { x: 10, y: 0 }
]

const descentWith = (...kinds: FiliationKind[]) =>
  lineStyleOf({
    childId: 'child',
    filiations: kinds.map(
      (kind, index): Filiation => ({
        childId: 'child',
        id: `filiation-${index}`,
        kind,
        parentId: `parent-${index}`
      })
    ),
    kind: 'descent',
    points: POINTS
  })

const unionOf = (kind: Union['kind']) =>
  lineStyleOf({
    kind: 'union',
    points: POINTS,
    union: {
      end: null,
      id: 'union',
      kind,
      partnerIds: ['first', 'second'],
      start: null
    }
  })

describe('lineStyleOf', () => {
  it('[line-style] draws a child of two birth parents with the plain line', () => {
    expect(descentWith('birth', 'birth')).toBe('plain')
  })

  it('[line-style] lets an adoption by one parent show over a birth to the other', () => {
    expect(descentWith('birth', 'adoption')).toBe('adoption')
  })

  it('[line-style] draws a step-child and a fostered child dotted', () => {
    expect(descentWith('birth', 'step')).toBe('step')
    expect(descentWith('foster')).toBe('step')
  })

  it('[line-style] keeps a known birth over an unknown link to the other parent', () => {
    expect(descentWith('unknown', 'birth')).toBe('plain')
    expect(descentWith('unknown')).toBe('unknown')
  })

  it('[line-style] gives a marriage and a PACS the heavy line, a free union the dashed one', () => {
    expect(unionOf('marriage')).toBe('marriage')
    expect(unionOf('pacs')).toBe('marriage')
    expect(unionOf('partnership')).toBe('free-union')
    expect(unionOf('unknown')).toBe('plain')
  })

  it('[line-style] draws two co-parents with no recorded union as an unknown link', () => {
    expect(lineStyleOf({ kind: 'union', points: POINTS, union: null })).toBe(
      'unknown'
    )
  })
})
