import type { EntityId } from '@arbor/protocol/entity-id'

/** The "+ Lien" mode as the canvas sees it: touching a person picks them instead of opening their sheet. */
export type CanvasLinking = {
  /** The person picked first, marked on the tree; `null` until someone is. */
  firstId: EntityId | null
  /** Picks a person touched or reached with the keyboard. */
  pick: (personId: EntityId) => void
  /** Picks both people of a line dragged from one sticker to another. */
  pickPair: (pair: { firstId: EntityId; secondId: EntityId }) => void
  /** Whether the person cannot be the next one picked: their sticker is greyed. */
  isRefused: (personId: EntityId) => boolean
}

/** The attribute a person's sticker carries, so a line dropped on the canvas finds whom it landed on. */
export const PERSON_ID_ATTRIBUTE = 'data-person-id'

/** A sticker that starts a drawn link on a mouse: the canvas does not pan from it. */
export const LINK_DRAG_START_CLASS = 'link-drag-start'
