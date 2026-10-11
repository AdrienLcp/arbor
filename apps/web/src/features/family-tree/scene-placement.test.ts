import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import type { FamilyState } from '@arbor/core/family/family-state'
import { replayOperations } from '@arbor/core/family/replay-operations'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'

import { placementOf } from './scene-placement'
import { treeScene } from './tree-scene'

const demoFamily = (): FamilyState => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const sceneOf = (family: FamilyState) =>
  treeScene({
    hasGenerationBands: false,
    layout: layoutWholeFamily(family),
    persons: family.persons
  })

describe('placementOf', () => {
  const family = demoFamily()
  const [someone, someoneElse] = [...family.persons.keys()]
  if (someone === undefined || someoneElse === undefined) {
    throw new Error('The demo family has fewer than two people')
  }

  it('is the same for two scenes a render builds again from one family', () => {
    expect(placementOf(sceneOf(family), someone)).toBe(
      placementOf(sceneOf(family), someone)
    )
  })

  it('changes when the tree turns to another person', () => {
    expect(placementOf(sceneOf(family), someone)).not.toBe(
      placementOf(sceneOf(family), someoneElse)
    )
  })

  it('changes when a card moves', () => {
    const scene = sceneOf(family)
    const [first, ...rest] = scene.layout.cards
    if (first === undefined) throw new Error('The demo family draws no card')
    const moved = {
      ...scene,
      layout: {
        ...scene.layout,
        cards: [{ ...first, x: first.x + 1 }, ...rest]
      }
    }
    expect(placementOf(moved, someone)).not.toBe(placementOf(scene, someone))
  })
})
