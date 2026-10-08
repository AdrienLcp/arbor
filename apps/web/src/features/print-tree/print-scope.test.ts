import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import { replayOperations } from '@arbor/core/family/replay-operations'
import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'

import { layoutOfPrintScope } from './print-scope'

const demoFamily = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const drawnPersonIds = (layout: TreeLayout) =>
  new Set(
    layout.cards.flatMap((card) =>
      card.kind === 'person' ? card.personId : []
    )
  )

describe('[print] who a print carries', () => {
  it('[print] prints the ancestors of someone up to the founders, and none of their cousins', () => {
    const drawn = drawnPersonIds(
      layoutOfPrintScope(demoFamily(), {
        depth: 'all',
        kind: 'ancestors',
        personId: 'lucie-morel'
      })
    )

    expect(drawn).toContain('auguste-morel')
    expect(drawn).toContain('helene-roux')
    expect(drawn).not.toContain('noah-morel')
    expect(drawn).not.toContain('michel-morel')
  })

  it('[print] stops the ancestors at the chosen depth', () => {
    const drawn = drawnPersonIds(
      layoutOfPrintScope(demoFamily(), {
        depth: 2,
        kind: 'ancestors',
        personId: 'lucie-morel'
      })
    )

    expect(drawn).toContain('pierre-morel')
    expect(drawn).not.toContain('louis-morel')
  })

  it('[print] prints the descendants of someone, and none of their parents', () => {
    const drawn = drawnPersonIds(
      layoutOfPrintScope(demoFamily(), {
        depth: 'all',
        kind: 'descendants',
        personId: 'pierre-morel'
      })
    )

    expect(drawn).toContain('anne-morel')
    expect(drawn).toContain('lucie-morel')
    expect(drawn).not.toContain('louis-morel')
    expect(drawn).not.toContain('noah-morel')
  })

  it('[print] falls back to the whole family when the person is gone', () => {
    const family = demoFamily()

    expect(
      layoutOfPrintScope(family, {
        depth: 3,
        kind: 'descendants',
        personId: 'nobody'
      })
    ).toEqual(layoutOfPrintScope(family, { kind: 'whole' }))
  })
})
