import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '../family/demo-family'
import { replayOperations } from '../family/replay-operations'
import { generatedFamily, MARRIED_IN_PARENTS_SURNAME } from './generated-family'
import { layoutDefects } from './layout-defects'
import { layoutWholeFamily } from './layout-whole-family'
import type { TreeCard, TreeLayout } from './tree-layout'
import { rowY } from './tree-metrics'

const demoFamily = () => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const NO_DEFECT = {
  duplicateKeys: [],
  linesUnderCards: [],
  offTheirRow: [],
  overlapping: []
}

const personCard = (layout: TreeLayout, personId: string): TreeCard => {
  const card = layout.cards.find(
    (candidate) =>
      candidate.kind === 'person' && candidate.personId === personId
  )
  if (card === undefined) throw new Error(`${personId} is not drawn`)
  return card
}

const descentTo = (layout: TreeLayout, childId: string) =>
  layout.connectors.flatMap((connector) =>
    connector.kind === 'descent' && connector.childId === childId
      ? connector.filiations.map(
          ({ kind, parentId }) => `${parentId} (${kind})`
        )
      : []
  )

const drawnPersonIds = (layout: TreeLayout) =>
  layout.cards.flatMap((card) => (card.kind === 'person' ? card.personId : []))

describe('[tree-layout] the whole family', () => {
  it('[tree-layout] draws every person of the demo family once, leaving the bin out', () => {
    const family = demoFamily()
    const layout = layoutWholeFamily(family)

    const expected = [...family.persons.keys()].filter(
      (personId) => !family.binnedPersonIds.has(personId)
    )
    expect(drawnPersonIds(layout).toSorted()).toEqual(expected.toSorted())
  })

  it('[tree-layout] starts from the founder with the most descendants', () => {
    const layout = layoutWholeFamily(demoFamily())

    const topRow = layout.cards
      .filter((card) => card.y === rowY(1))
      .flatMap((card) => (card.kind === 'person' ? card.personId : []))
    expect(topRow).toEqual(['marie-le-goff', 'auguste-morel'])
  })

  it('[tree-layout] lays the demo family out with no misreadable card or line', () => {
    expect(layoutDefects(layoutWholeFamily(demoFamily()))).toEqual(NO_DEFECT)
  })

  it('[tree-layout] lays a 300-person family out with no misreadable card or line', () => {
    expect(layoutDefects(layoutWholeFamily(generatedFamily(300)))).toEqual(
      NO_DEFECT
    )
  })

  it('[tree-layout] leaves out the parents of whoever married in', () => {
    const family = generatedFamily(300)
    const layout = layoutWholeFamily(family)

    const marriedInParents = [...family.persons.values()].filter(
      ({ surname }) => surname === MARRIED_IN_PARENTS_SURNAME
    )
    expect(marriedInParents.length).toBeGreaterThan(0)
    expect(drawnPersonIds(layout)).toHaveLength(
      family.persons.size - marriedInParents.length
    )
  })

  it('[tree-layout] keeps every couple side by side', () => {
    for (const family of [demoFamily(), generatedFamily(300)]) {
      const unionLines = layoutWholeFamily(family).connectors.filter(
        ({ kind }) => kind === 'union'
      )
      expect(unionLines.every(({ points }) => points.length === 2)).toBe(true)
    }
  })

  it('[tree-layout] puts the second partner on the right and the first on the left', () => {
    const layout = layoutWholeFamily(demoFamily())

    expect(personCard(layout, 'helene-roux').x).toBeLessThan(
      personCard(layout, 'louis-morel').x
    )
    expect(personCard(layout, 'yvonne-guerin').x).toBeGreaterThan(
      personCard(layout, 'louis-morel').x
    )
  })

  it('[tree-layout] puts an unknown other parent on the right', () => {
    const layout = layoutWholeFamily(demoFamily())
    const jeanne = personCard(layout, 'jeanne-morel')

    const unknownBeside = layout.cards.filter(
      (card) => card.kind === 'unknown-parent' && card.y === jeanne.y
    )
    expect(unknownBeside).toHaveLength(1)
    expect(unknownBeside[0]?.x).toBeGreaterThan(jeanne.x)
  })

  it('[tree-layout] tells both filiations of a child adopted by a parent’s partner', () => {
    expect(descentTo(layoutWholeFamily(demoFamily()), 'lucie-morel')).toEqual([
      'anne-morel (birth)',
      'sophie-garnier (adoption)'
    ])
  })

  it('[tree-layout] hangs a step-child under the union with their parent', () => {
    expect(descentTo(layoutWholeFamily(demoFamily()), 'thomas-bertin')).toEqual(
      ['pierre-morel (step)', 'odile-bertin (birth)']
    )
  })
})
