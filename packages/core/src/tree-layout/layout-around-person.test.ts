import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import type { FamilyState } from '../family/family-state'
import { replayOperations } from '../family/replay-operations'
import { generatedFamily } from './generated-family'
import { layoutAroundPerson } from './layout-around-person'
import { layoutDefects } from './layout-defects'
import type { TreeLayout } from './tree-layout'

const demoFamily = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const around = (
  family: FamilyState,
  focusId: string,
  depth = { generationsDown: 3, generationsUp: 3 }
): TreeLayout => {
  const layout = layoutAroundPerson(family, { focusId, ...depth })
  if (layout.status === 'failure')
    throw new Error(`${focusId}: ${layout.error}`)
  return layout.data
}

const drawnPersonIds = (layout: TreeLayout) =>
  layout.cards
    .flatMap((card) => (card.kind === 'person' ? card.personId : []))
    .toSorted()

const NO_DEFECT = {
  duplicateKeys: [],
  linesUnderCards: [],
  offTheirRow: [],
  overlapping: []
}

describe('[tree-layout] around a person', () => {
  it('[tree-layout] draws a person’s ancestors above them, every parent’s own parents in turn', () => {
    expect(drawnPersonIds(around(demoFamily(), 'lucie-morel'))).toEqual(
      [
        'lucie-morel',
        'anne-morel',
        'sophie-garnier',
        'pierre-morel',
        'claire-dubois',
        'louis-morel',
        'helene-roux'
      ].toSorted()
    )
  })

  it('[tree-layout] stops the ancestors and descendants at the depth asked', () => {
    const layout = around(demoFamily(), 'pierre-morel', {
      generationsDown: 1,
      generationsUp: 1
    })

    expect(drawnPersonIds(layout)).toEqual(
      [
        'louis-morel',
        'helene-roux',
        'pierre-morel',
        'claire-dubois',
        'odile-bertin',
        'anne-morel',
        'sophie-garnier',
        'thomas-bertin'
      ].toSorted()
    )
  })

  it('[tree-layout] centres a person’s parents above them', () => {
    const layout = around(demoFamily(), 'anne-morel')
    const descent = layout.connectors.find(
      (connector) =>
        connector.kind === 'descent' && connector.childId === 'anne-morel'
    )

    expect(descent?.points.map(({ x }) => x)).toEqual([
      descent?.points[0]?.x,
      descent?.points[0]?.x
    ])
  })

  it('[tree-layout] lays out every demo person’s hourglass with no misreadable card or line', () => {
    const family = demoFamily()
    for (const focusId of family.persons.keys()) {
      if (family.binnedPersonIds.has(focusId)) continue
      expect(layoutDefects(around(family, focusId)), focusId).toEqual(NO_DEFECT)
    }
  })

  it('[tree-layout] lays out hourglasses in a 300-person family with no misreadable card or line', () => {
    const family = generatedFamily(300)
    for (const focusId of [...family.persons.keys()].filter(
      (_, index) => index % 10 === 0
    )) {
      expect(layoutDefects(around(family, focusId)), focusId).toEqual(NO_DEFECT)
    }
  })

  it('[tree-layout] refuses a person in the bin', () => {
    const layout = layoutAroundPerson(demoFamily(), {
      focusId: 'simone-morel-duplicate',
      generationsDown: 1,
      generationsUp: 1
    })

    expect(layout).toEqual({ error: 'person_binned', status: 'failure' })
  })
})
