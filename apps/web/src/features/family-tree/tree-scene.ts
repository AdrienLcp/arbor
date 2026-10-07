import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import type { TreeLayout, TreePoint } from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import { yearOf } from '@/features/people/fuzzy-year'

/** The rail at the left of every band: its head, its years and its count. */
export const RAIL_WIDTH = 176

/** Paper around the drawing, so nothing touches the edge of the plane. */
const PLANE_MARGIN = 48

/** How far a band reaches above its row of cards: room for the slot numbers. */
const BAND_ABOVE_CARDS = 30
/** How far a band reaches below its row of cards: room for the union words. */
const BAND_BELOW_CARDS = 16

/** A generation's strip across the plane, with what its rail prints. */
export type GenerationBand = {
  bottom: number
  /** The earliest and latest birth years known in the band; `null` when none is. */
  births: { first: number; last: number } | null
  generation: number
  /** Outlines of unknown parents: slots still to complete. */
  missingCount: number
  personCount: number
  top: number
}

/** A layout placed on its plane, whose top-left corner is `origin` in layout coordinates. */
export type TreeScene = {
  bands: readonly GenerationBand[]
  height: number
  layout: TreeLayout
  origin: TreePoint
  width: number
}

const birthsOf = (
  personIds: readonly EntityId[],
  persons: ReadonlyMap<EntityId, Person>
): GenerationBand['births'] => {
  const years = personIds.flatMap(
    (personId) => yearOf(persons.get(personId)?.birth?.date) ?? []
  )

  return years.length === 0
    ? null
    : { first: Math.min(...years), last: Math.max(...years) }
}

const bandsOf = (
  layout: TreeLayout,
  persons: ReadonlyMap<EntityId, Person>
): GenerationBand[] => {
  const rows = Map.groupBy(layout.cards, (card) => card.generation)

  return Array.from(rows, ([generation, cards]): GenerationBand => {
    const personIds = [
      ...new Set(
        cards.flatMap((card) => (card.kind === 'person' ? card.personId : []))
      )
    ]
    const rowTop = Math.min(...cards.map((card) => card.y))

    return {
      births: birthsOf(personIds, persons),
      bottom: rowTop + CARD_HEIGHT + BAND_BELOW_CARDS,
      generation,
      missingCount: cards.filter((card) => card.kind === 'unknown-parent')
        .length,
      personCount: personIds.length,
      top: rowTop - BAND_ABOVE_CARDS
    }
  }).toSorted((first, second) => first.generation - second.generation)
}

/** Where a layout sits on its plane: room for the rails on the left, a margin all round. */
export const treeScene = ({
  layout,
  persons
}: {
  layout: TreeLayout
  persons: ReadonlyMap<EntityId, Person>
}): TreeScene => {
  const bands = bandsOf(layout, persons)
  const points = layout.connectors.flatMap((connector) => connector.points)
  const xs = [
    ...layout.cards.flatMap((card) => [card.x, card.x + CARD_WIDTH]),
    ...points.map((point) => point.x)
  ]
  const ys = [
    ...bands.flatMap((band) => [band.top, band.bottom]),
    ...points.map((point) => point.y)
  ]

  if (xs.length === 0 || ys.length === 0) {
    return { bands, height: 0, layout, origin: { x: 0, y: 0 }, width: 0 }
  }

  const origin = {
    x: Math.min(...xs) - RAIL_WIDTH - PLANE_MARGIN,
    y: Math.min(...ys) - PLANE_MARGIN
  }

  return {
    bands,
    height: Math.max(...ys) + PLANE_MARGIN - origin.y,
    layout,
    origin,
    width: Math.max(...xs) + PLANE_MARGIN - origin.x
  }
}
