import type React from 'react'
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from 'react-zoom-pan-pinch'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import type { KinPath } from '@arbor/core/kinship/kinship'
import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

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
/** The stickers at their own size: the scale the canvas opens at, whatever it was left at. */
const ARRIVAL_SCALE = 1
/** Paper kept around a lit path when it is fitted on screen: room for the slot numbers and the focus card. */
const LIT_PATH_MARGIN = 112
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
  /** A kinship path to trace and fit on screen; `null` to centre on the focus person. */
  litPath: KinPath | null
  onPressPerson: (personId: EntityId) => void
  persons: ReadonlyMap<EntityId, Person>
  scene: TreeScene
  slotNumbers: ReadonlyMap<string, number>
  today: Temporal.PlainDate
  /** The share of the window's height a bottom sheet hides, so the focus person is centred in what stays in sight. */
  coveredBottomShare?: number
}

/** The tree on a canvas to pan, pinch and zoom, and to walk through person by person with the arrow keys. */
export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  coveredBottomShare = 0,
  focusId,
  label,
  litPath,
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
  /** Whether the visitor panned or zoomed since the canvas last centred itself: from then on a resize leaves the view where they put it. */
  const hasVisitorMoved = useRef(false)
  const centredScene = useRef<TreeScene | null>(null)

  const personCards = scene.layout.cards.filter(isPersonCard)
  const focusKey = focusKeyIn(scene, focusId)
  const currentKey = personCards.some((card) => card.key === activeKey)
    ? activeKey
    : focusKey

  const centreOn = (
    key: string | null,
    animationMs: number,
    {
      bottomShare = coveredBottomShare,
      scale
    }: { bottomShare?: number; scale?: number } = {}
  ) => {
    const element = key === null ? undefined : cardElements.current.get(key)
    const controls = viewport.current
    if (element === undefined || controls === null) return
    void controls.zoomToElement(
      element,
      {
        offsetY: -(bottomShare * window.innerHeight) / 2,
        scale: scale ?? controls.state.scale
      },
      animationMs
    )
  }

  /** Fits the lit path on screen, never closer than the stickers' own size. */
  const showLitPath = (placed: TreeScene): boolean => {
    const controls = viewport.current
    const wrapper = controls?.instance.wrapperComponent
    if (litPath === null || controls == null || wrapper == null) return false
    const litIds = new Set(litPath)
    const litCards = placed.layout.cards.filter(
      (card) => card.kind === 'person' && litIds.has(card.personId)
    )
    if (litCards.length === 0) return false

    const left = Math.min(...litCards.map(({ x }) => x)) - placed.origin.x
    const top = Math.min(...litCards.map(({ y }) => y)) - placed.origin.y
    const right =
      Math.max(...litCards.map(({ x }) => x + CARD_WIDTH)) - placed.origin.x
    const bottom =
      Math.max(...litCards.map(({ y }) => y + CARD_HEIGHT)) - placed.origin.y
    const scale = Math.min(
      1,
      wrapper.clientWidth / (right - left + 2 * LIT_PATH_MARGIN),
      wrapper.clientHeight / (bottom - top + 2 * LIT_PATH_MARGIN)
    )
    controls.setTransform(
      wrapper.clientWidth / 2 - ((left + right) / 2) * scale,
      wrapper.clientHeight / 2 - ((top + bottom) / 2) * scale,
      scale,
      0
    )
    return true
  }

  const centreOnArrival = () => {
    hasVisitorMoved.current = false
    if (!showLitPath(scene)) centreOn(focusKey, 0, { scale: ARRIVAL_SCALE })
  }

  // A new scene jumps, inside the refocus transition, so the stickers slide from where they were to the centre; a phone's bottom sheet opening or closing glides, a computer's side sheet leaves the tree still.
  const centreOnFocusOf = useEffectEvent(
    (placed: TreeScene, bottomShare: number) => {
      const isNewScene = placed !== centredScene.current
      centredScene.current = placed
      hasVisitorMoved.current = false
      if (!showLitPath(placed)) {
        centreOn(focusKeyIn(placed, focusId), isNewScene ? 0 : GLIDE_MS, {
          bottomShare
        })
      }
    }
  )
  useLayoutEffect(() => {
    centreOnFocusOf(scene, coveredBottomShare)
  }, [scene, coveredBottomShare])

  // The canvas can be measured before its stylesheet sizes it: until the visitor moves, a new size centres it again.
  const centreAfterResize = useEffectEvent(() => {
    if (!hasVisitorMoved.current) centreOnArrival()
  })
  useEffect(() => {
    const wrapper = viewport.current?.instance.wrapperComponent
    if (wrapper == null) return
    let lastSize = ''
    const observer = new ResizeObserver(() => {
      const size = `${wrapper.clientWidth}x${wrapper.clientHeight}`
      if (size === lastSize) return
      lastSize = size
      centreAfterResize()
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  const noteVisitorMoved = () => {
    hasVisitorMoved.current = true
  }

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
        onInit={centreOnArrival}
        onPanningStart={noteVisitorMoved}
        onPinchStart={noteVisitorMoved}
        onTransform={(_, { positionY, scale }) => {
          rails.current?.style.setProperty('--pan-y', `${positionY}px`)
          rails.current?.style.setProperty('--zoom', String(scale))
        }}
        onWheelStart={noteVisitorMoved}
        onZoomStart={noteVisitorMoved}
        ref={viewport}
      >
        {(controls) => (
          <>
            <TransformComponent wrapperClass='tree-viewport'>
              <TreePlane
                activeKey={currentKey}
                focusId={focusId}
                instructionsId={instructionsId}
                litPath={litPath}
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
            {scene.hasGenerationBands ? (
              <GenerationRails ref={rails} scene={scene} />
            ) : null}
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
