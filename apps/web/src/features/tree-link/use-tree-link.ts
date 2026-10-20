import { useEffect, useReducer } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'
import { linkRefusal } from '@arbor/core/relatives/existing-relative-link'

import type { FamilyEdit } from '@/features/family-edits/use-family-edit'
import type { CanvasLinking } from '@/features/family-tree/canvas-linking'

import { defaultTreeLinkDetails, treeLinkOf } from './tree-link-of'
import {
  nextTreeLinkStep,
  TREE_LINK_OFF,
  type TreeLinkKind,
  type TreeLinkStep
} from './tree-link-step'

const isPicking = (
  current: TreeLinkStep
): current is Extract<TreeLinkStep, { step: 'anchor' | 'first' | 'second' }> =>
  current.step === 'anchor' ||
  current.step === 'first' ||
  current.step === 'second'

/**
 * The tree's add mode: its step, and what the canvas needs while
 * people are being picked. A second person is checked against the family's
 * rules with the link's default details, a marriage or a birth; the
 * confirmation checks the details chosen there again.
 */
export const useTreeLink = ({
  edit,
  family,
  onAddTo
}: {
  edit: FamilyEdit
  family: FamilyState
  /** Opens the way to add someone new to the person touched. */
  onAddTo: (personId: EntityId) => void
}) => {
  const [current, dispatch] = useReducer(nextTreeLinkStep, TREE_LINK_OFF)

  const refusalOf = ({
    firstId,
    kind,
    secondId
  }: {
    firstId: EntityId
    kind: TreeLinkKind
    secondId: EntityId
  }) =>
    linkRefusal(
      family,
      treeLinkOf({
        details: defaultTreeLinkDetails(family, secondId),
        family,
        firstId,
        kind,
        secondId
      })
    )

  const refusedIds =
    current.step === 'second'
      ? new Set(
          family.persons
            .keys()
            .filter(
              (personId) =>
                personId !== current.firstId &&
                refusalOf({ ...current, secondId: personId }) !== null
            )
        )
      : new Set<EntityId>()

  const pick = (personId: EntityId) => {
    if (current.step === 'anchor') onAddTo(personId)
    dispatch({
      personId,
      refusal:
        current.step === 'second'
          ? refusalOf({ ...current, secondId: personId })
          : null,
      type: 'pick'
    })
  }

  const pickPair = ({
    firstId,
    secondId
  }: {
    firstId: EntityId
    secondId: EntityId
  }) => {
    if (!isPicking(current) || current.step === 'anchor') return
    if (current.step === 'first') {
      dispatch({ personId: firstId, refusal: null, type: 'pick' })
    } else if (current.firstId !== firstId) {
      return
    }
    dispatch({
      personId: secondId,
      refusal: refusalOf({ firstId, kind: current.kind, secondId }),
      type: 'pick'
    })
  }

  const linking: CanvasLinking | undefined = isPicking(current)
    ? {
        firstId: current.step === 'second' ? current.firstId : null,
        isRefused: (personId) => refusedIds.has(personId),
        pick,
        pickPair
      }
    : undefined

  const isPickingPeople = isPicking(current)
  useEffect(() => {
    if (!isPickingPeople) return
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch({ type: 'cancel' })
    }
    window.addEventListener('keydown', cancelOnEscape)
    return () => window.removeEventListener('keydown', cancelOnEscape)
  }, [isPickingPeople])

  return {
    cancel: () => {
      edit.dismissFailure()
      dispatch({ type: 'cancel' })
    },
    choose: (kind: TreeLinkKind) => dispatch({ kind, type: 'choose' }),
    chooseNew: () => dispatch({ type: 'chooseNew' }),
    chooseOther: () => {
      edit.dismissFailure()
      dispatch({ type: 'chooseOther' })
    },
    current,
    linking,
    start: () => edit.signFirst(() => dispatch({ type: 'start' }))
  }
}

/** The tree's add mode, as the page holds it. */
export type TreeLink = ReturnType<typeof useTreeLink>
