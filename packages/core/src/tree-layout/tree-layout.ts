import type { EntityId } from '@arbor/protocol/entity-id'
import type { Filiation } from '@arbor/protocol/filiation'
import type { Union } from '@arbor/protocol/union'

export type TreePoint = { x: number; y: number }

type CardPlacement = {
  generation: number
  /** Unique across the layout. */
  key: string
  /** Top-left corner. */
  x: number
  y: number
}

/** A sticker on the canvas: a person, or the empty slot of an unknown other parent. */
export type TreeCard = CardPlacement &
  (
    | {
        /** The person is drawn elsewhere already: a second link reaches them. */
        isRepeated: boolean
        kind: 'person'
        personId: EntityId
      }
    | { kind: 'unknown-parent' }
  )

/** A line on the canvas, as a polyline of orthogonal segments. */
export type TreeConnector =
  | {
      kind: 'union'
      points: readonly TreePoint[]
      /** `null` between parents with no recorded union, or beside an unknown parent. */
      union: Union | null
    }
  | { kind: 'siblings'; points: readonly TreePoint[] }
  | {
      childId: EntityId
      /** Every filiation of the child to the parents above: a child born to one and adopted by the other carries both. */
      filiations: readonly Filiation[]
      kind: 'descent'
      points: readonly TreePoint[]
    }

export type TreeLayout = {
  cards: readonly TreeCard[]
  connectors: readonly TreeConnector[]
}

export const EMPTY_TREE_LAYOUT: TreeLayout = { cards: [], connectors: [] }
