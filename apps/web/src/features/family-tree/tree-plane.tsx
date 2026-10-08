import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { ViewTransition } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'
import type { Person } from '@arbor/protocol/person'

import { isLiving } from '@arbor/core/family/is-living'
import type { KinPath } from '@arbor/core/kinship/kinship'
import type { TreeCard } from '@arbor/core/tree-layout/tree-layout'
import { CARD_HEIGHT, CARD_WIDTH } from '@arbor/core/tree-layout/tree-metrics'

import { kinHighlightOf } from '@/features/kinship/kin-highlight'
import { lifeYears } from '@/features/people/life-years'
import { personName } from '@/features/people/person-name'
import { PortraitImage } from '@/features/photos/portrait-image'
import { generationClass } from '@/presentation/components/generation-class'
import { GhostSlot } from '@/presentation/components/ghost-slot'
import { monogramOf } from '@/presentation/components/monogram'
import { SlotButton } from '@/presentation/components/slot-button'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { RelationWords } from './relation-words'
import { pathOf, TreeLines } from './tree-lines'
import type { TreeScene } from './tree-scene'

import './tree-plane.sass'

/** The slot size the layout was computed for, handed to the stickers so the two never disagree. */
const SLOT_SIZE: React.CSSProperties = {
  '--slot-height': `${CARD_HEIGHT}px`,
  '--slot-width': `${CARD_WIDTH}px`
}

type PersonCard = Extract<TreeCard, { kind: 'person' }>

export type TreePlaneProps = {
  /** The card arrow keys and Tab land on: the only one in the tab order. */
  activeKey: string | null
  focusId: EntityId
  /** Describes how to move between the stickers, on each of them. */
  instructionsId: string
  /** How two people are related, traced over the tree with everyone else faded; `null` when nothing is lit. */
  litPath: KinPath | null
  /** An arrow key pressed on a sticker; `true` when the key was an arrow, so its default scroll is kept from happening. */
  onArrowKey: (card: PersonCard, key: string) => boolean
  onFocusCard: (card: PersonCard) => void
  onPressPerson: (card: PersonCard) => void
  persons: ReadonlyMap<EntityId, Person>
  /** Keeps a card's element, so the keyboard can move focus to it and the canvas centre on it. */
  registerCard: (key: string, element: HTMLElement | null) => void
  scene: TreeScene
  /** The number printed above each card's slot. */
  slotNumbers: ReadonlyMap<string, number>
  today: Temporal.PlainDate
}

/** The drawing at its natural size: generation bands when shown, relation lines, their words and the stickers, placed by the layout. */
export const TreePlane: React.FC<TreePlaneProps> = ({
  activeKey,
  focusId,
  instructionsId,
  litPath,
  onArrowKey,
  onFocusCard,
  onPressPerson,
  persons,
  registerCard,
  scene,
  slotNumbers,
  today
}) => {
  const translate = useTranslate()
  const highlight =
    litPath === null ? null : kinHighlightOf(scene.layout, litPath)
  const isUnlit = (card: TreeCard): boolean =>
    highlight !== null && !highlight.cardKeys.has(card.key)
  const placeOf = ({
    x,
    y
  }: {
    x: number
    y: number
  }): React.CSSProperties => ({
    '--x': `${x - scene.origin.x}px`,
    '--y': `${y - scene.origin.y}px`
  })

  const cardOf = (card: TreeCard) => {
    const slotNumber = slotNumbers.get(card.key) ?? 0

    if (card.kind === 'unknown-parent') {
      return (
        <GhostSlot
          className={classNames('tree-card', isUnlit(card) && 'unlit')}
          generation={card.generation}
          hint={translate('tree.unknownParent.hint')}
          key={card.key}
          slotNumber={slotNumber}
          style={{ ...SLOT_SIZE, ...placeOf(card) }}
          title={translate('tree.unknownParent.title')}
        />
      )
    }

    const person = persons.get(card.personId)
    if (person === undefined) return null

    const isDeceased = !isLiving(person, today)
    const years = lifeYears(person, !isDeceased)
    const name = personName(person) ?? translate('common.unnamedPerson')
    const sticker = (
      <SlotButton
        aria-describedby={instructionsId}
        aria-label={years === '' ? name : `${name}, ${years}`}
        className={classNames('tree-card', isUnlit(card) && 'unlit')}
        excludeFromTabOrder={card.key !== activeKey}
        key={card.key}
        onFocus={() => onFocusCard(card)}
        onKeyDown={(event) => {
          if (onArrowKey(card, event.key)) {
            event.preventDefault()
          } else {
            event.continuePropagation()
          }
        }}
        onPress={() => onPressPerson(card)}
        ref={(element) => registerCard(card.key, element)}
        style={placeOf(card)}
      >
        <Sticker
          className={classNames(
            card.personId === focusId && !card.isRepeated && 'focus',
            card.isRepeated && 'repeated'
          )}
          generation={card.generation}
          givenNames={person.givenNames}
          isDeceased={isDeceased}
          lifeYears={years}
          monogram={monogramOf(person)}
          portrait={<PortraitImage photoId={person.portraitPhotoId} />}
          slotNumber={slotNumber}
          style={SLOT_SIZE}
          surname={person.surname}
        />
      </SlotButton>
    )

    return card.isRepeated ? (
      sticker
    ) : (
      <ViewTransition key={card.key} name={`person-${card.personId}`}>
        {sticker}
      </ViewTransition>
    )
  }

  return (
    <div
      className={classNames('tree-plane', highlight !== null && 'is-lit')}
      style={{
        '--plane-height': `${scene.height}px`,
        '--plane-width': `${scene.width}px`
      }}
    >
      {(scene.hasGenerationBands ? scene.bands : []).map((band) => (
        <div
          className={classNames(
            'generation-strip',
            generationClass(band.generation)
          )}
          key={band.generation}
          style={{
            '--band-height': `${band.bottom - band.top}px`,
            '--y': `${band.top - scene.origin.y}px`
          }}
        />
      ))}
      <TreeLines scene={scene} />
      {highlight === null ? null : (
        <svg
          aria-hidden='true'
          className='kin-marker'
          height={scene.height}
          width={scene.width}
        >
          <g transform={`translate(${-scene.origin.x} ${-scene.origin.y})`}>
            {highlight.strokes.map((points) => (
              <path
                className='kin-marker-stroke'
                d={pathOf(points)}
                key={pathOf(points)}
              />
            ))}
          </g>
        </svg>
      )}
      {scene.layout.cards.map(cardOf)}
      <RelationWords scene={scene} />
    </div>
  )
}
