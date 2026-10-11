import type { TreePoint } from '@arbor/core/tree-layout/tree-layout'

const middleOf = (from: TreePoint, to: TreePoint): TreePoint => ({
  x: (from.x + to.x) / 2,
  y: (from.y + to.y) / 2
})

/** The middle of a union line, where its words sit: between neighbours, the gap; for a bracket, its top. */
export const unionMiddle = (points: readonly TreePoint[]): TreePoint => {
  const [first, second, third] = points
  if (first === undefined || second === undefined) return { x: 0, y: 0 }
  return third === undefined ? middleOf(first, second) : middleOf(second, third)
}

/** Partners side by side are joined straight across the gap; partners further apart, by a bracket over the row. */
export const isBetweenNeighbours = (points: readonly TreePoint[]) =>
  points.length === 2
