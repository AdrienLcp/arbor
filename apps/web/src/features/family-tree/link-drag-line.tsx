import type React from 'react'
import { useEffect, useEffectEvent, useRef } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { type CanvasLinking, PERSON_ID_ATTRIBUTE } from './canvas-linking'

/** How far the mouse travels before a press on a sticker becomes a drawn line, so a click stays a click. */
const DRAG_THRESHOLD_PX = 6

/** Ahead of the sticker's own press handling, which keeps pointer events from bubbling. */
const CAPTURE = { capture: true }

type Point = { x: number; y: number }

const personIdAt = (element: Element | null): EntityId | null =>
  element
    ?.closest(`[${PERSON_ID_ATTRIBUTE}]`)
    ?.getAttribute(PERSON_ID_ATTRIBUTE) ?? null

/** A point of the window in the plane's own pixels, whatever the zoom and the pan. */
const planePointOf = (plane: HTMLElement, { x, y }: Point): Point => {
  const box = plane.getBoundingClientRect()
  const scale = box.width / plane.offsetWidth
  return { x: (x - box.left) / scale, y: (y - box.top) / scale }
}

const centreOf = (element: Element): Point => {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

type LinkDragLineProps = {
  linking: CanvasLinking
}

/**
 * With a mouse, a line drawn from one sticker to another picks both people at
 * once. It lives inside the plane and follows the pointer by its attributes
 * alone, so a drag never re-renders the drawing.
 */
export const LinkDragLine: React.FC<LinkDragLineProps> = ({ linking }) => {
  const drawing = useRef<SVGSVGElement>(null)
  const line = useRef<SVGLineElement>(null)
  const canStartFrom = useEffectEvent(
    (personId: EntityId) =>
      linking.firstId === null || linking.firstId === personId
  )
  const pickPair = useEffectEvent(linking.pickPair)

  useEffect(() => {
    const plane = drawing.current?.parentElement
    const stroke = line.current
    if (plane == null || stroke === null) return
    let drag: { from: EntityId; isDrawn: boolean; start: Point } | null = null

    const drawTo = (pointer: Point) => {
      const end = planePointOf(plane, pointer)
      stroke.setAttribute('x2', String(end.x))
      stroke.setAttribute('y2', String(end.y))
    }
    const stop = () => {
      drag = null
      drawing.current?.removeAttribute('data-drawn')
    }

    const press = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if (!(event.target instanceof Element)) return
      const from = personIdAt(event.target)
      if (from === null || !canStartFrom(from)) return
      const sticker = event.target.closest(`[${PERSON_ID_ATTRIBUTE}]`)
      if (sticker === null) return
      const origin = planePointOf(plane, centreOf(sticker))
      stroke.setAttribute('x1', String(origin.x))
      stroke.setAttribute('y1', String(origin.y))
      drag = {
        from,
        isDrawn: false,
        start: { x: event.clientX, y: event.clientY }
      }
    }
    const move = (event: PointerEvent) => {
      if (drag === null) return
      const pointer = { x: event.clientX, y: event.clientY }
      if (
        !drag.isDrawn &&
        Math.hypot(pointer.x - drag.start.x, pointer.y - drag.start.y) <
          DRAG_THRESHOLD_PX
      ) {
        return
      }
      drag.isDrawn = true
      drawTo(pointer)
      drawing.current?.setAttribute('data-drawn', '')
    }
    const release = (event: PointerEvent) => {
      if (drag === null) return
      const { from, isDrawn } = drag
      stop()
      if (!isDrawn) return
      const secondId = personIdAt(
        document.elementFromPoint(event.clientX, event.clientY)
      )
      if (secondId !== null && secondId !== from)
        pickPair({ firstId: from, secondId })
    }
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop()
    }

    plane.addEventListener('pointerdown', press, CAPTURE)
    window.addEventListener('pointermove', move, CAPTURE)
    window.addEventListener('pointerup', release, CAPTURE)
    window.addEventListener('pointercancel', stop, CAPTURE)
    window.addEventListener('keydown', cancelOnEscape)
    return () => {
      plane.removeEventListener('pointerdown', press, CAPTURE)
      window.removeEventListener('pointermove', move, CAPTURE)
      window.removeEventListener('pointerup', release, CAPTURE)
      window.removeEventListener('pointercancel', stop, CAPTURE)
      window.removeEventListener('keydown', cancelOnEscape)
    }
  }, [])

  return (
    <svg aria-hidden='true' className='link-drag-line' ref={drawing}>
      <line ref={line} />
    </svg>
  )
}
