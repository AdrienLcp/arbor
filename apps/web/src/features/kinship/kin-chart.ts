import type { EntityId } from '@arbor/protocol/entity-id'

import type { KinStep } from '@arbor/core/kinship/kin-steps'
import type { KinPath } from '@arbor/core/kinship/kinship'

import {
  filiationLineStyle,
  type LineStyle,
  unionLineStyle
} from '@/features/family-tree/line-style'

/**
 * A person on the chart. `column` counts half-lanes: the two sides of a
 * relation stand two apart, the ancestor they share in between them.
 */
export type ChartNode = { column: number; personId: EntityId; row: number }

export type ChartLink = {
  from: ChartNode
  /** An ended union is cut by two slashes, as in the tree. */
  isEnded: boolean
  style: LineStyle
  to: ChartNode
}

/** The path drawn as a small tree: climbing one side to the shared ancestor, down the other, across to a partner. */
export type KinChart = {
  columns: number
  links: readonly ChartLink[]
  nodes: readonly ChartNode[]
  rows: number
}

const linkOf = (step: KinStep): Pick<ChartLink, 'isEnded' | 'style'> =>
  step.direction === 'across'
    ? {
        isEnded: step.union?.end != null,
        style: unionLineStyle(step.union)
      }
    : { isEnded: false, style: filiationLineStyle(step.filiation.kind) }

/** The next person's place: down in their own lane, or in the next lane once the path turns or crosses over. */
const nextPlace = (
  previous: ChartNode,
  { step, turnsDown }: { step: KinStep; turnsDown: boolean }
): Pick<ChartNode, 'column' | 'row'> => {
  switch (step.direction) {
    case 'up':
      return { column: previous.column, row: previous.row - 1 }
    case 'down':
      return {
        column: previous.column + (turnsDown ? 2 : 0),
        row: previous.row + 1
      }
    case 'across':
      return { column: previous.column + 2, row: previous.row }
    default:
      return step satisfies never
  }
}

export const kinChartOf = ({
  path,
  steps
}: {
  path: KinPath
  steps: readonly KinStep[]
}): KinChart => {
  const [firstId] = path
  if (firstId === undefined) {
    return { columns: 0, links: [], nodes: [], rows: 0 }
  }

  const nodes: ChartNode[] = [{ column: 0, personId: firstId, row: 0 }]
  steps.forEach((step, index) => {
    const previous = nodes[index]
    const personId = path[index + 1]
    if (previous === undefined || personId === undefined) return

    const turnsDown =
      step.direction === 'down' && steps[index - 1]?.direction === 'up'
    if (turnsDown) {
      // The shared ancestor stands between the two sides.
      nodes[index] = { ...previous, column: previous.column + 1 }
    }
    nodes.push({ personId, ...nextPlace(previous, { step, turnsDown }) })
  })

  const topRow = Math.min(...nodes.map(({ row }) => row))
  const placed = nodes.map((node) => ({ ...node, row: node.row - topRow }))

  return {
    columns: Math.max(...placed.map(({ column }) => column)) + 1,
    links: steps.flatMap((step, index) => {
      const from = placed[index]
      const to = placed[index + 1]
      return from === undefined || to === undefined
        ? []
        : [{ from, to, ...linkOf(step) }]
    }),
    nodes: placed,
    rows: Math.max(...placed.map(({ row }) => row)) + 1
  }
}
