import { describe, expect, it } from 'vitest'

import { type PrintPage, printPlan } from './print-pages'

/** Where a mark on a page falls in the drawing: the page's window maps onto its area. */
const drawingXOf = (page: PrintPage, pageX: number): number =>
  page.area.x + pageX - page.window.x
const drawingYOf = (page: PrintPage, pageY: number): number =>
  page.area.y + pageY - page.window.y

describe('[print] pages of a print', () => {
  it('[print] lays an A3 landscape sheet on one page inside its margins', () => {
    const plan = printPlan({
      kind: 'sheet',
      orientation: 'landscape',
      paper: 'a3'
    })

    expect(plan.drawing).toEqual({ height: 277, width: 400 })
    expect(plan.pages).toHaveLength(1)
    expect(plan.pages[0]?.size).toEqual({ height: 297, width: 420 })
    expect(plan.pages[0]?.window).toEqual({
      height: 277,
      width: 400,
      x: 10,
      y: 10
    })
  })

  it('[print] turns a portrait sheet on its side for landscape', () => {
    const portrait = printPlan({
      kind: 'sheet',
      orientation: 'portrait',
      paper: 'a4'
    })

    expect(portrait.pages[0]?.size).toEqual({ height: 297, width: 210 })
  })

  const poster = printPlan({
    columns: 3,
    kind: 'poster',
    orientation: 'landscape',
    rows: 2
  })

  it('[print] tiles a 3 by 2 poster over six landscape A4 sheets, row by row', () => {
    expect(poster.pages).toHaveLength(6)
    expect(poster.pages.map((page) => page.tile)).toEqual([
      { column: 1, row: 1 },
      { column: 2, row: 1 },
      { column: 3, row: 1 },
      { column: 1, row: 2 },
      { column: 2, row: 2 },
      { column: 3, row: 2 }
    ])
    expect(poster.pages.every((page) => page.size.width === 297)).toBe(true)
  })

  it('[print] repeats a strip of each tile on its neighbour, and ends exactly on the drawing’s edge', () => {
    const [first, second, third, , , last] = poster.pages

    expect(second?.area.x).toBe(
      (first?.area.x ?? 0) + (first?.area.width ?? 0) - 12
    )
    expect((third?.area.x ?? 0) + (third?.area.width ?? 0)).toBe(
      poster.drawing.width
    )
    expect((last?.area.y ?? 0) + (last?.area.height ?? 0)).toBe(
      poster.drawing.height
    )
    expect(poster.drawing).toEqual({ height: 368, width: 807 })
  })

  it('[print] marks where the next tile is glued at the very line where it is cut', () => {
    const [first, second, , below] = poster.pages
    if (first === undefined || second === undefined || below === undefined) {
      throw new Error('The poster has six pages')
    }
    const glueX = first.marks.glue.find((mark) => mark.from.x === mark.to.x)
      ?.from.x
    const cutX = second.marks.cut.find((mark) => mark.from.x === mark.to.x)
      ?.from.x
    const glueY = first.marks.glue.find((mark) => mark.from.y === mark.to.y)
      ?.from.y
    const cutY = below.marks.cut.find((mark) => mark.from.y === mark.to.y)?.from
      .y

    expect(drawingXOf(first, glueX ?? 0)).toBe(drawingXOf(second, cutX ?? 0))
    expect(drawingYOf(first, glueY ?? 0)).toBe(drawingYOf(below, cutY ?? 0))
  })

  it('[print] leaves no cut mark on the first tile and no glue mark on the last', () => {
    expect(poster.pages[0]?.marks.cut).toEqual([])
    expect(poster.pages.at(-1)?.marks.glue).toEqual([])
  })
})
