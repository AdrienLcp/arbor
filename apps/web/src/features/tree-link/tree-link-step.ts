import type { EntityId } from '@arbor/protocol/entity-id'

import type { LinkRefusal } from '@arbor/core/relatives/existing-relative-link'

/** The links the canvas draws between two people already in the tree. */
export const TREE_LINK_KINDS = ['couple', 'parentChild', 'siblings'] as const
export type TreeLinkKind = (typeof TREE_LINK_KINDS)[number]

/** A person touched who cannot be the second one, and why: the banner says it until another is touched. */
export type RefusedPick = { personId: EntityId; refusal: LinkRefusal }

/**
 * Where the "+ Lien" mode stands:
 * - `'off'` — the tree acts as usual: touching someone opens their sheet
 * - `'choosing'` — the kind of link is asked
 * - `'first'` — the first person is awaited (the parent, for a parent and a child)
 * - `'second'` — the second person is awaited; `refused` is the last refused touch
 * - `'confirming'` — both are picked: the link is spelled out before it is saved
 */
export type TreeLinkStep =
  | { step: 'off' }
  | { step: 'choosing' }
  | { kind: TreeLinkKind; step: 'first' }
  | {
      firstId: EntityId
      kind: TreeLinkKind
      refused: RefusedPick | null
      step: 'second'
    }
  | {
      firstId: EntityId
      kind: TreeLinkKind
      secondId: EntityId
      step: 'confirming'
    }

export type TreeLinkEvent =
  | { type: 'start' }
  | { kind: TreeLinkKind; type: 'choose' }
  /** A person touched or dropped on; `refusal` is why the family would refuse them as the second person. */
  | { personId: EntityId; refusal: LinkRefusal | null; type: 'pick' }
  /** Back from the confirmation, to touch another second person. */
  | { type: 'chooseOther' }
  | { type: 'cancel' }

export const TREE_LINK_OFF: TreeLinkStep = { step: 'off' }

const pick = (
  current: TreeLinkStep,
  { personId, refusal }: { personId: EntityId; refusal: LinkRefusal | null }
): TreeLinkStep => {
  switch (current.step) {
    case 'first':
      return {
        firstId: personId,
        kind: current.kind,
        refused: null,
        step: 'second'
      }
    case 'second':
      if (personId === current.firstId)
        return { kind: current.kind, step: 'first' }
      if (refusal !== null)
        return { ...current, refused: { personId, refusal } }
      return {
        firstId: current.firstId,
        kind: current.kind,
        secondId: personId,
        step: 'confirming'
      }
    default:
      return current
  }
}

/** The next step of the "+ Lien" mode; touching the first person again lets go of them. */
export const nextTreeLinkStep = (
  current: TreeLinkStep,
  event: TreeLinkEvent
): TreeLinkStep => {
  switch (event.type) {
    case 'start':
      return { step: 'choosing' }
    case 'choose':
      return current.step === 'choosing'
        ? { kind: event.kind, step: 'first' }
        : current
    case 'pick':
      return pick(current, event)
    case 'chooseOther':
      return current.step === 'confirming'
        ? {
            firstId: current.firstId,
            kind: current.kind,
            refused: null,
            step: 'second'
          }
        : current
    case 'cancel':
      return TREE_LINK_OFF
  }
}
