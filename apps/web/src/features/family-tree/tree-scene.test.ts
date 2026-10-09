import { describe, expect, it } from 'vitest'

import type { Person } from '@arbor/protocol/person'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import type { FamilyState } from '@arbor/core/family/family-state'
import { replayOperations } from '@arbor/core/family/replay-operations'
import { generatedFamily } from '@arbor/core/tree-layout/generated-family'
import { layoutWholeFamily } from '@arbor/core/tree-layout/layout-whole-family'
import type { TreeLayout } from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import { RAIL_WIDTH, treeScene } from './tree-scene'

const demoFamily = (): FamilyState => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return family.data
}

const sceneOf = (family: FamilyState) =>
  treeScene({
    hasGenerationBands: true,
    layout: layoutWholeFamily(family),
    persons: family.persons
  })

const FAMILIES = [
  ['the demo family', demoFamily()],
  ['a generated 300-person family', generatedFamily(300)]
] as const

describe.each(FAMILIES)('treeScene of %s', (_, family) => {
  const scene = sceneOf(family)
  const toPlane = (x: number, y: number) => ({
    x: x - scene.origin.x,
    y: y - scene.origin.y
  })
  const isOnPlane = ({ x, y }: { x: number; y: number }) =>
    x >= 0 && y >= 0 && x <= scene.width && y <= scene.height

  it('[tree-scene] keeps every card and every line on the plane', () => {
    const corners = scene.layout.cards.flatMap((card) => [
      toPlane(card.x, card.y),
      toPlane(card.x + CARD_WIDTH, card.y + CARD_HEIGHT)
    ])
    const points = scene.layout.connectors.flatMap((connector) =>
      connector.points.map(({ x, y }) => toPlane(x, y))
    )

    expect(
      [...corners, ...points].filter((point) => !isOnPlane(point))
    ).toEqual([])
  })

  it('[tree-scene] leaves the rail its room left of the leftmost card', () => {
    const leftmost = Math.min(...scene.layout.cards.map((card) => card.x))

    expect(leftmost - scene.origin.x).toBeGreaterThanOrEqual(RAIL_WIDTH)
  })

  it('[tree-scene] stacks one band per generation, oldest on top, each holding its row', () => {
    const generations = scene.bands.map((band) => band.generation)

    expect(generations).toEqual(generations.toSorted((a, b) => a - b))
    for (const card of scene.layout.cards) {
      const band = scene.bands.find(
        ({ generation }) => generation === card.generation
      )
      expect(band?.top).toBeLessThan(card.y)
      expect(band?.bottom).toBeGreaterThan(card.y + CARD_HEIGHT)
    }
  })
})

describe('treeScene', () => {
  it('[tree-scene] counts a person drawn twice once, and an unknown parent as a slot to complete', () => {
    const layout: TreeLayout = {
      cards: [
        {
          generation: 2,
          isRepeated: false,
          key: 'anne',
          kind: 'person',
          personId: 'anne',
          x: 0,
          y: 280
        },
        {
          generation: 2,
          isRepeated: true,
          key: 'anne@elsewhere',
          kind: 'person',
          personId: 'anne',
          x: 400,
          y: 280
        },
        {
          generation: 2,
          key: 'unknown',
          kind: 'unknown-parent',
          x: 152,
          y: 280
        }
      ],
      connectors: []
    }

    const [band] = treeScene({
      hasGenerationBands: true,
      layout,
      persons: new Map()
    }).bands

    expect(band).toMatchObject({
      births: null,
      generation: 2,
      missingCount: 1,
      personCount: 1
    })
  })

  it('[tree-scene] reads the band years from the births of the people drawn', () => {
    const bornIn = (id: string, year: number): Person => ({
      birth: {
        date: { point: { precision: 'year', year }, qualifier: 'exact' },
        place: null
      },
      birthSurname: null,
      death: null,
      givenNames: id,
      id,
      livingOverride: null,
      notes: '',
      portraitPhotoId: null,
      sex: 'unknown',
      surname: 'Morel'
    })
    const personCard = (
      id: string,
      x: number
    ): TreeLayout['cards'][number] => ({
      generation: 1,
      isRepeated: false,
      key: id,
      kind: 'person',
      personId: id,
      x,
      y: 0
    })
    const layout: TreeLayout = {
      cards: [personCard('auguste', 0), personCard('marie', 152)],
      connectors: []
    }
    const persons = new Map([
      ['auguste', bornIn('auguste', 1902)],
      ['marie', bornIn('marie', 1898)]
    ])

    const [band] = treeScene({
      hasGenerationBands: true,
      layout,
      persons
    }).bands

    expect(band?.births).toEqual({ first: 1898, last: 1902 })
  })
})
