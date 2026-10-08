import { describe, expect, it } from 'vitest'

import { DEMO_FAMILY_OPERATIONS } from '@arbor/core/family/demo-family'
import { replayOperations } from '@arbor/core/family/replay-operations'
import { kinStepsAlong } from '@arbor/core/kinship/kin-steps'
import type { KinPath } from '@arbor/core/kinship/kinship'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import { kinChartOf } from './kin-chart'

const chartOf = (path: KinPath) => {
  const family = replayOperations(DEMO_FAMILY_OPERATIONS)
  if (family.status === 'failure') throw new Error('The demo family is refused')
  return kinChartOf({
    path,
    steps: kinStepsAlong(familyLineage(family.data), path)
  })
}

const placesOf = (path: KinPath) =>
  chartOf(path).nodes.map(({ column, personId, row }) => [
    personId,
    column,
    row
  ])

describe('[kinship] the chart of a path', () => {
  it('[kinship] climbs one lane, puts the shared ancestor between, comes down the other', () => {
    expect(
      placesOf(['anne-morel', 'pierre-morel', 'louis-morel', 'michel-morel'])
    ).toEqual([
      ['anne-morel', 0, 2],
      ['pierre-morel', 0, 1],
      ['louis-morel', 1, 0],
      ['michel-morel', 2, 1]
    ])
  })

  it('[kinship] keeps a straight line of descent in one lane', () => {
    expect(
      chartOf(['auguste-morel', 'louis-morel', 'pierre-morel']).columns
    ).toBe(1)
  })

  it('[kinship] sets a partner beside, on a cut line after a divorce', () => {
    const chart = chartOf(['anne-morel', 'pierre-morel', 'claire-dubois'])

    expect(
      chart.nodes.map(({ column, personId, row }) => [personId, column, row])
    ).toEqual([
      ['anne-morel', 0, 1],
      ['pierre-morel', 0, 0],
      ['claire-dubois', 2, 0]
    ])
    expect(chart.links.at(-1)).toMatchObject({
      isEnded: true,
      style: 'marriage'
    })
  })
})
