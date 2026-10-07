import type React from 'react'
import { useEffectEvent, useId, useLayoutEffect, useRef, useState } from 'react'
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from 'react-zoom-pan-pinch'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'

import { Button } from '@/presentation/components/button'
import {
  FitIcon,
  RecenterIcon,
  ZoomInIcon,
  ZoomOutIcon
} from '@/presentation/components/icons'
import { Toolbar } from '@/presentation/components/toolbar'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { GenerationRails } from './generation-rails'
import { arrowDirectionOf, nearestCardToward } from './nearest-card'
import { TreePlane } from './tree-plane'
import type { TreeScene } from './tree-scene'

import './tree-canvas.sass'

const MIN_SCALE = 0.15
const MAX_SCALE = 2
/** How long the canvas glides to the person the keyboard moved to. */
const GLIDE_MS = 200

type PersonCard = Extract<TreeCard, { kind: 'person' }>

const isPersonCard = (card: TreeCard): card is PersonCard =>
  card.kind === 'person'

/** The key of the focus person's own card: the first one drawn for them, not a repeat. */
const focusKeyIn = (scene: TreeScene, focusId: EntityId): string | null =>
  scene.layout.cards.find(
    (card) =>
      card.kind === 'person' && card.personId === focusId && !card.isRepeated
  )?.key ?? null

type TreeCanvasProps = {
  focusId: EntityId
  /** Names the canvas for a screen reader: "The tree, around Pierre Morel". */
  label: string
  onPressPerson: (personId: EntityId) => void
  persons: ReadonlyMap<EntityId, Person>
  scene: TreeScene
  slotNumbers: ReadonlyMap<string, number>
  today: Temporal.PlainDate
}

/** The tree on a canvas to pan, pinch and zoom, and to walk through person by person with the arrow keys. */
export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  focusId,
  label,
  onPressPerson,
  persons,
  scene,
  slotNumbers,
  today
}) => {
  const translate = useTranslate()
  const instructionsId = useId()
  const viewport = useRef<ReactZoomPanPinchRef>(null)
  const cardElements = useRef(new Map<string, HTMLElement>())
  const rails = useRef<HTMLDivElement>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const personCards = scene.layout.cards.filter(isPersonCard)
  const focusKey = focusKeyIn(scene, focusId)
  const currentKey = personCards.some((card) => card.key === activeKey)
    ? activeKey
    : focusKey

  const centreOn = (key: string | null, animationMs: number) => {
    const element = key === null ? undefined : cardElements.current.get(key)
    const controls = viewport.current
    if (element === undefined || controls === null) return
    void controls.zoomToElement(
      element,
      { scale: controls.state.scale },
      animationMs
    )
  }

  // Inside the refocus transition, so the stickers slide from where they were to the centre.
  const centreOnFocusOf = useEffectEvent((placed: TreeScene) =>
    centreOn(focusKeyIn(placed, focusId), 0)
  )
  useLayoutEffect(() => {
    centreOnFocusOf(scene)
  }, [scene])

  const registerCard = (key: string, element: HTMLElement | null) => {
    if (element === null) {
      cardElements.current.delete(key)
    } else {
      cardElements.current.set(key, element)
    }
  }

  const walkWithArrows = (from: PersonCard, key: string): boolean => {
    const direction = arrowDirectionOf(key)
    if (direction === null) return false

    const next = nearestCardToward({ cards: personCards, direction, from })
    if (next !== null) {
      setActiveKey(next.key)
      cardElements.current.get(next.key)?.focus()
      centreOn(next.key, GLIDE_MS)
    }
    return true
  }

  const pressPerson = (card: PersonCard) => {
    setActiveKey(null)
    onPressPerson(card.personId)
    if (card.personId === focusId) centreOn(focusKey, GLIDE_MS)
  }

  return (
    <section aria-label={label} className='tree-canvas'>
      <TransformWrapper
        doubleClick={{ disabled: true }}
        limitToBounds={false}
        maxScale={MAX_SCALE}
        minScale={MIN_SCALE}
        onInit={() => centreOn(focusKey, 0)}
        onTransform={(_, { positionY, scale }) => {
          rails.current?.style.setProperty('--pan-y', `${positionY}px`)
          rails.current?.style.setProperty('--zoom', String(scale))
        }}
        ref={viewport}
      >
        {(controls) => (
          <>
            <TransformComponent wrapperClass='tree-viewport'>
              <TreePlane
                activeKey={currentKey}
                focusId={focusId}
                instructionsId={instructionsId}
                onArrowKey={walkWithArrows}
                onFocusCard={(card) => setActiveKey(card.key)}
                onPressPerson={pressPerson}
                persons={persons}
                registerCard={registerCard}
                scene={scene}
                slotNumbers={slotNumbers}
                today={today}
              />
            </TransformComponent>
            <GenerationRails ref={rails} scene={scene} />
            <p className='tree-instructions' id={instructionsId}>
              {translate('tree.instructions')}
            </p>
            <Toolbar
              aria-label={translate('tree.zoom.label')}
              className='tree-zoom'
              orientation='vertical'
            >
              <Button
                aria-label={translate('tree.zoom.in')}
                onPress={() => void controls.zoomIn()}
                variant='quiet'
              >
                <ZoomInIcon aria-hidden='true' />
              </Button>
              <Button
                aria-label={translate('tree.zoom.out')}
                onPress={() => void controls.zoomOut()}
                variant='quiet'
              >
                <ZoomOutIcon aria-hidden='true' />
              </Button>
              <Button
                aria-label={translate('tree.zoom.recentre')}
                onPress={() => centreOn(focusKey, GLIDE_MS)}
                variant='quiet'
              >
                <RecenterIcon aria-hidden='true' />
              </Button>
              <Button
                aria-label={translate('tree.zoom.fit')}
                onPress={() => void controls.fitToView()}
                variant='quiet'
              >
                <FitIcon aria-hidden='true' />
              </Button>
            </Toolbar>
          </>
        )}
      </TransformWrapper>
    </section>
  )
}
