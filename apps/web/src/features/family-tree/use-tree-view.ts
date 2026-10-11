import { startTransition, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { TreeScope, TreeView } from './tree-view'

export type TreeViewControls = {
  /** Turns the tree around another person, as a transition: the stickers slide to their new places. */
  setFocus: (focusId: EntityId) => void
  setScope: (scope: TreeScope) => void
  /** Leaves the list for the drawing around a person picked in it. */
  showAround: (focusId: EntityId) => void
  view: TreeView
}

/** What the tree shows, and the controls that change it. */
export const useTreeView = ({
  fallbackFocusId,
  initialFocusId,
  isInTree,
  myPersonId,
  shownPersonId,
  turnsToMe
}: {
  /** Where the tree turns when the person in its middle leaves it, put in the bin. */
  fallbackFocusId: EntityId | null
  isInTree: (personId: EntityId) => boolean
  initialFocusId: EntityId
  /** The person the visitor says they are: once they say it, the tree turns around them when `turnsToMe` lets it. */
  myPersonId: EntityId | null
  /** The person whose sheet is open over the tree: the tree turns to them, so closing the sheet lands on their page. */
  shownPersonId: EntityId | null
  /** Whether saying who they are turns the tree to the visitor: not while a sheet is open, nor when they answered before a change, which holds the tree on what they are changing. */
  turnsToMe: boolean
}): TreeViewControls => {
  const [view, setView] = useState<TreeView>({
    focusId: initialFocusId,
    scope: 'whole'
  })
  const [followedPersonId, setFollowedPersonId] = useState(shownPersonId)

  if (shownPersonId !== followedPersonId) {
    setFollowedPersonId(shownPersonId)
    if (shownPersonId !== null) {
      setView((current) => ({ ...current, focusId: shownPersonId }))
    }
  }

  const [followedMeId, setFollowedMeId] = useState(myPersonId)

  if (myPersonId !== followedMeId) {
    setFollowedMeId(myPersonId)
    if (myPersonId !== null && turnsToMe && isInTree(myPersonId)) {
      setView((current) => ({ ...current, focusId: myPersonId }))
    }
  }

  if (
    !isInTree(view.focusId) &&
    fallbackFocusId !== null &&
    fallbackFocusId !== view.focusId
  ) {
    setView((current) => ({ ...current, focusId: fallbackFocusId }))
  }

  const changeView = (change: Partial<TreeView>) => {
    startTransition(() => {
      setView((current) => ({ ...current, ...change }))
    })
  }

  return {
    setFocus: (focusId) => changeView({ focusId }),
    setScope: (scope) => changeView({ scope }),
    showAround: (focusId) => changeView({ focusId, scope: 'around' }),
    view
  }
}
