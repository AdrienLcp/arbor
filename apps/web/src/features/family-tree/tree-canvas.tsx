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
import { FINE_POINTER } from '@/presentation/components/fine-pointer'
import {
  FitIcon,
  RecenterIcon,
  ZoomInIcon,
  ZoomOutIcon
} from '@/presentation/components/icons'
import { FOLDED_BAR_SCREEN } from '@/presentation/components/phone-screen'
import { Toolbar } from '@/presentation/components/toolbar'
import { useMediaQuery } from '@/presentation/components/use-media-query'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { type CanvasLinking, LINK_DRAG_START_CLASS } from './canvas-linking'
import { fitView } from './fit-view'
import { GenerationRails } from './generation-rails'
import { arrowDirectionOf, nearestCardToward } from './nearest-card'
import { placementOf } from './scene-placement'
import { TreePlane } from './tree-plane'
import type { TreeScene } from './tree-scene'
import { visibleBandOf } from './visible-band'
import { isWalkableCard } from './walkable-card'

import './tree-canvas.sass'

const MIN_SCALE = 0.15
const MAX_SCALE = 2
/** The stickers at their own size: the scale the canvas opens at, whatever it was left at. */
const ARRIVAL_SCALE = 1
/** Paper kept around a lit path when it is fitted on screen: room for the focus card. */
const LIT_PATH_MARGIN = 112
/** Paper kept above and below the open person's sticker when a bottom sheet leaves little of the tree in sight: room for the bookmark ribbon. */
const BAND_MARGIN = 16
/** How long the canvas glides to the person the keyboard moved to. */
const GLIDE_MS = 200

type PersonCard = Extract<TreeCard, { kind: 'person' }>

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
  /** The "+ Lien" mode, while it is on. */
  linking?: CanvasLinking
  /** A tool of the tree's own, set atop the zoom buttons: the "+ Lien" button. */
  linkTool?: React.ReactNode
  onPressPerson: (personId: EntityId) => void
  /** Opens the way to add the unknown other parent of this child; left out for a visitor who may not change the tree. */
  onPressUnknownParent?: (childId: EntityId) => void
  /** The person whose sheet is open, marked on their sticker; `null` when no sheet is. */
  openPersonId: EntityId | null
  persons: ReadonlyMap<EntityId, Person>
  scene: TreeScene
  today: Temporal.PlainDate
  /** The share of the window's height a bottom sheet hides, so the focus person is centred in what stays in sight. */
  coveredBottomShare?: number
  /** The whole-family view the canvas opens on with every card fitted in sight, never past the stickers' own size, unless a sheet is open; `null` opens on the focus person. Switching to another such view fits the tree again. */
  wholeTreeView?: string | null
}

/** The tree on a canvas to pan, pinch and zoom, and to walk through person by person with the arrow keys. */
export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  coveredBottomShare = 0,
  focusId,
  label,
  linking,
  linkTool,
  litPath,
  onPressPerson,
  onPressUnknownParent,
  openPersonId,
  persons,
  scene,
  today,
  wholeTreeView = null
}) => {
  const hasFinePointer = useMediaQuery(FINE_POINTER)
  /** A phone held upright lays the tools in one row under the canvas. */
  const isToolbarRow = useMediaQuery(FOLDED_BAR_SCREEN)
  const translate = useTranslate()
  const instructionsId = useId()
  const viewport = useRef<ReactZoomPanPinchRef>(null)
  const cardElements = useRef(new Map<string, HTMLElement>())
  const rails = useRef<HTMLDivElement>(null)
  const zoomTools = useRef<HTMLDivElement>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  /** Whether the visitor panned or zoomed since the canvas last centred itself: from then on a resize leaves the view where they put it. */
  const hasVisitorMoved = useRef(false)
  const centred = useRef<{
    bottomShare: number
    placement: string
    wholeTreeView: string | null
  } | null>(null)

  const walkableCards = scene.layout.cards.filter((card) =>
    isWalkableCard(card, {
      canFillIn: onPressUnknownParent !== undefined && linking === undefined
    })
  )
  const focusKey = focusKeyIn(scene, focusId)
  const currentKey = walkableCards.some((card) => card.key === activeKey)
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
    const wrapper = controls?.instance.wrapperComponent
    if (element === undefined || controls == null || wrapper == null) return
    const band = visibleBandOf({
      canvas: wrapper.getBoundingClientRect(),
      coveredBottomShare: bottomShare,
      windowHeight: window.innerHeight
    })
    const fittingScale =
      bottomShare === 0
        ? Number.POSITIVE_INFINITY
        : band.height / (CARD_HEIGHT + 2 * BAND_MARGIN)
    void controls.zoomToElement(
      element,
      {
        offsetY: band.centreOffset,
        scale: Math.min(scale ?? controls.state.scale, fittingScale)
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

  /** Fits every card in the part of the canvas left in sight by the generation rails, the zoom column, the focus card and a phone's sheet. */
  const showWholeTree = ({
    animationMs,
    maxScale
  }: {
    animationMs: number
    maxScale: number
  }) => {
    const controls = viewport.current
    const wrapper = controls?.instance.wrapperComponent
    if (controls == null || wrapper == null) return
    const { cards } = scene.layout
    if (cards.length === 0) return

    const canvas = wrapper.getBoundingClientRect()
    const band = visibleBandOf({
      canvas,
      coveredBottomShare,
      windowHeight: window.innerHeight
    })
    const bandTop = canvas.height / 2 + band.centreOffset - band.height / 2
    // A column of tools stands over the canvas's right; a phone's toolbar lies under it and hides nothing.
    const toolsLeft = isToolbarRow
      ? undefined
      : zoomTools.current?.getBoundingClientRect().left
    const railsRight = Math.max(
      canvas.left,
      ...[...(rails.current?.children ?? [])].map(
        (rail) => rail.getBoundingClientRect().right
      )
    )
    const focusCardTop = document
      .querySelector('.focus-card')
      ?.getBoundingClientRect().top
    const fitted = fitView({
      content: {
        bottom:
          Math.max(...cards.map(({ y }) => y + CARD_HEIGHT)) - scene.origin.y,
        left: Math.min(...cards.map(({ x }) => x)) - scene.origin.x,
        right:
          Math.max(...cards.map(({ x }) => x + CARD_WIDTH)) - scene.origin.x,
        top: Math.min(...cards.map(({ y }) => y)) - scene.origin.y
      },
      margin: BAND_MARGIN,
      maxScale,
      minScale: MIN_SCALE,
      view: {
        bottom: Math.min(
          bandTop + band.height,
          focusCardTop === undefined
            ? Number.POSITIVE_INFINITY
            : focusCardTop - canvas.top
        ),
        left: railsRight - canvas.left,
        right:
          toolsLeft === undefined
            ? canvas.width
            : Math.min(canvas.width, toolsLeft - canvas.left),
        top: bandTop
      }
    })
    controls.setTransform(fitted.x, fitted.y, fitted.scale, animationMs)
  }

  /** A sheet open on arrival is about its person, kept in sight beside it. */
  const opensOnWholeTree = wholeTreeView !== null && openPersonId === null

  const showWholeTreeOnArrival = () =>
    showWholeTree({ animationMs: 0, maxScale: ARRIVAL_SCALE })

  const centreOnArrival = () => {
    hasVisitorMoved.current = false
    if (showLitPath(scene)) return
    if (opensOnWholeTree) {
      showWholeTreeOnArrival()
    } else {
      centreOn(focusKey, 0, { scale: ARRIVAL_SCALE })
    }
  }

  // A new scene jumps, inside the refocus transition, so the stickers slide from where they were to the centre; a phone's bottom sheet opening or closing glides, a computer's side sheet leaves the tree still.
  const centreOnFocusOf = useEffectEvent(
    (placed: TreeScene, bottomShare: number) => {
      const placement = placementOf(placed, focusId)
      const isNewScene = placement !== centred.current?.placement
      if (!isNewScene && bottomShare === centred.current?.bottomShare) return
      const isNewWholeTreeView =
        opensOnWholeTree && wholeTreeView !== centred.current?.wholeTreeView
      centred.current = { bottomShare, placement, wholeTreeView }
      hasVisitorMoved.current = false
      if (showLitPath(placed)) return
      if (isNewWholeTreeView) {
        showWholeTreeOnArrival()
      } else {
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

  const walkWithArrows = (from: TreeCard, key: string): boolean => {
    const direction = arrowDirectionOf(key)
    if (direction === null) return false

    const next = nearestCardToward({ cards: walkableCards, direction, from })
    if (next !== null) {
      setActiveKey(next.key)
      cardElements.current.get(next.key)?.focus()
      centreOn(next.key, GLIDE_MS)
    }
    return true
  }

  const pressPerson = (card: PersonCard) => {
    if (linking !== undefined) {
      linking.pick(card.personId)
      return
    }
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
        panning={{ excluded: [LINK_DRAG_START_CLASS] }}
        ref={viewport}
      >
        {(controls) => (
          <>
            <TransformComponent wrapperClass='tree-viewport'>
              <TreePlane
                activeKey={currentKey}
                canDrawLinks={hasFinePointer}
                focusId={focusId}
                instructionsId={instructionsId}
                linking={linking}
                litPath={litPath}
                onArrowKey={walkWithArrows}
                onFocusCard={(card) => setActiveKey(card.key)}
                onPressPerson={pressPerson}
                onPressUnknownParent={onPressUnknownParent}
                openPersonId={openPersonId}
                persons={persons}
                registerCard={registerCard}
                scene={scene}
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
              orientation={isToolbarRow ? 'horizontal' : 'vertical'}
              ref={zoomTools}
            >
              {linkTool}
              <Button
                aria-label={translate('tree.zoom.in')}
                onPress={() => {
                  noteVisitorMoved()
                  void controls.zoomIn()
                }}
                variant='quiet'
              >
                <ZoomInIcon aria-hidden='true' />
              </Button>
              <Button
                aria-label={translate('tree.zoom.out')}
                onPress={() => {
                  noteVisitorMoved()
                  void controls.zoomOut()
                }}
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
                onPress={() => {
                  noteVisitorMoved()
                  showWholeTree({ animationMs: GLIDE_MS, maxScale: MAX_SCALE })
                }}
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
