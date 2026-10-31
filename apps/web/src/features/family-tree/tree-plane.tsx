import { classNames } from '@adrienlcp/react'
import type React from 'react'
import { ViewTransition } from 'react'
import type { ButtonProps } from 'react-aria-components'

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
import { CheckIcon } from '@/presentation/components/icons'
import { monogramOf } from '@/presentation/components/monogram'
import { SlotButton } from '@/presentation/components/slot-button'
import { Sticker } from '@/presentation/components/sticker'
import { useTranslate } from '@/presentation/i18n/i18n-context'

import { hiddenConnectors, isCardHidden } from './hidden-connectors'
import { RelationWords } from './relation-words'
import { pathOf, TreeLines } from './tree-lines'
import type { TreeScene } from './tree-scene'
import { useUnknownParentWords } from './use-unknown-parent-words'

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
  /** Children whose other parent the visitor chose to hide: the empty slot beside them says so, and offers no adding. */
  hiddenParentChildIds: ReadonlySet<EntityId>
  /** The people hidden while choosing who to show: each card carries a tick, a press toggles it, the hidden fade in place. `null` outside that mode. */
  hiddenWhileChoosing: ReadonlySet<EntityId> | null
  /** Describes how to move between the stickers, on each of them. */
  instructionsId: string
  /** How two people are related, traced over the tree with everyone else faded; `null` when nothing is lit. */
  litPath: KinPath | null
  /** An arrow key pressed on a card; `true` when the key was an arrow, so its default scroll is kept from happening. */
  onArrowKey: (card: TreeCard, key: string) => boolean
  onFocusCard: (card: TreeCard) => void
  onPressPerson: (card: PersonCard) => void
  /** Opens the way to add the unknown other parent of this child; left out for a visitor who may not change the tree. */
  onPressUnknownParent?: (childId: EntityId) => void
  /** The person whose sheet is open beside or under the tree, `null` when none is. */
  openPersonId: EntityId | null
  persons: ReadonlyMap<EntityId, Person>
  /** Keeps a card's element, so the keyboard can move focus to it and the canvas centre on it. */
  registerCard: (key: string, element: HTMLElement | null) => void
  scene: TreeScene
  today: Temporal.PlainDate
}

/** The drawing at its natural size: generation bands when shown, relation lines, their words and the stickers, placed by the layout. */
export const TreePlane: React.FC<TreePlaneProps> = ({
  activeKey,
  focusId,
  hiddenParentChildIds,
  hiddenWhileChoosing,
  instructionsId,
  litPath,
  onArrowKey,
  onFocusCard,
  onPressPerson,
  onPressUnknownParent,
  openPersonId,
  persons,
  registerCard,
  scene,
  today
}) => {
  const translate = useTranslate()
  const unknownParentWords = useUnknownParentWords()
  const highlight =
    litPath === null ? null : kinHighlightOf(scene.layout, litPath)
  const isUnlit = (card: TreeCard): boolean =>
    highlight !== null && !highlight.cardKeys.has(card.key)
  const isChoosing = hiddenWhileChoosing !== null
  const isFaded = (card: TreeCard): boolean =>
    hiddenWhileChoosing !== null && isCardHidden(card, hiddenWhileChoosing)
  const hiddenLines =
    hiddenWhileChoosing === null
      ? new Set<never>()
      : hiddenConnectors(scene.layout, hiddenWhileChoosing)
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

  const calledName = (personId: EntityId | undefined): string | null => {
    const person = personId === undefined ? undefined : persons.get(personId)
    if (person === undefined) return null
    return (
      person.givenNames ||
      (personName(person) ?? translate('common.unnamedPerson'))
    )
  }
  const walkingProps = (
    card: TreeCard
  ): Pick<ButtonProps, 'excludeFromTabOrder' | 'onFocus' | 'onKeyDown'> &
    React.RefAttributes<HTMLButtonElement> => ({
    excludeFromTabOrder: card.key !== activeKey,
    onFocus: () => onFocusCard(card),
    onKeyDown: (event) => {
      if (onArrowKey(card, event.key)) {
        event.preventDefault()
      } else {
        event.continuePropagation()
      }
    },
    ref: (element) => registerCard(card.key, element)
  })

  const cardOf = (card: TreeCard) => {
    const cardClassName = classNames(
      'tree-card',
      isUnlit(card) && 'unlit',
      isFaded(card) && 'is-hidden'
    )

    if (card.kind === 'unknown-parent') {
      const [childId] = card.childIds
      const words = unknownParentWords(calledName(childId))
      const isParentHidden = card.childIds.some((id) =>
        hiddenParentChildIds.has(id)
      )
      if (
        onPressUnknownParent === undefined ||
        childId === undefined ||
        isChoosing ||
        isParentHidden
      ) {
        return (
          <GhostSlot
            className={cardClassName}
            generation={card.generation}
            hint={words.hint}
            key={card.key}
            style={{ ...SLOT_SIZE, ...placeOf(card) }}
            title={translate(
              isParentHidden
                ? 'tree.choose.hiddenParent'
                : 'tree.unknownParent.title'
            )}
          />
        )
      }
      return (
        <SlotButton
          aria-describedby={instructionsId}
          aria-label={words.label}
          className={cardClassName}
          key={card.key}
          onPress={() => onPressUnknownParent(childId)}
          style={placeOf(card)}
          {...walkingProps(card)}
        >
          <GhostSlot
            action={translate('tree.unknownParent.action')}
            generation={card.generation}
            hint={words.hint}
            style={SLOT_SIZE}
            title={translate('tree.unknownParent.title')}
          />
        </SlotButton>
      )
    }

    const person = persons.get(card.personId)
    if (person === undefined) return null

    const isDeceased = !isLiving(person, today)
    const years = lifeYears(person, !isDeceased)
    const isUnnamed = personName(person) === null
    // Someone recorded with nothing known, like the parent two siblings share, reads as an empty slot: touching it opens their sheet to complete.
    const isUnknown =
      isUnnamed && years === '' && person.portraitPhotoId === null
    const sticker = (
      <SlotButton
        aria-describedby={instructionsId}
        aria-label={
          isUnknown
            ? translate('tree.unknownParent.title')
            : isUnnamed
              ? [translate('common.unnamedPerson'), years]
                  .filter((words) => words !== '')
                  .join(', ')
              : undefined
        }
        aria-pressed={isChoosing ? !isFaded(card) : undefined}
        className={cardClassName}
        key={card.key}
        onPress={() => onPressPerson(card)}
        style={placeOf(card)}
        {...walkingProps(card)}
      >
        {isUnknown ? (
          <GhostSlot
            action={translate('tree.unknownParent.action')}
            generation={card.generation}
            hint={unknownParentWords(null).hint}
            style={SLOT_SIZE}
            title={translate('tree.unknownParent.title')}
          />
        ) : (
          <Sticker
            className={classNames(
              card.personId === focusId && !card.isRepeated && 'focus',
              card.isRepeated && 'repeated'
            )}
            generation={card.generation}
            givenNames={person.givenNames}
            isDeceased={isDeceased}
            isOpen={card.personId === openPersonId && !card.isRepeated}
            lifeYears={years}
            monogram={monogramOf(person)}
            portrait={<PortraitImage photoId={person.portraitPhotoId} />}
            style={SLOT_SIZE}
            surname={person.surname}
          />
        )}
        {isChoosing ? (
          <span aria-hidden='true' className='tree-tick'>
            <CheckIcon className='tree-tick-mark' />
          </span>
        ) : null}
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
      className={classNames(
        'tree-plane',
        highlight !== null && 'is-lit',
        isChoosing && 'is-choosing'
      )}
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
      <TreeLines hiddenLines={hiddenLines} scene={scene} />
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
      <RelationWords hiddenLines={hiddenLines} scene={scene} />
    </div>
  )
}
