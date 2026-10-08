import { startTransition, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { DEFAULT_TREE_DEPTH, type TreeScope, type TreeView } from './tree-view'

export type TreeViewControls = {
  setDepth: (depth: number) => void
  /** Turns the tree around another person, as a transition: the stickers slide to their new places. */
  setFocus: (focusId: EntityId) => void
  setScope: (scope: TreeScope) => void
  /** Leaves the list for the drawing around a person picked in it. */
  showAround: (focusId: EntityId) => void
  view: TreeView
}

/** What the tree shows, and the controls that change it. */
export const useTreeView = ({
  initialFocusId,
  isFocusMe,
  shownPersonId
}: {
  initialFocusId: EntityId
  /** On arrival, a visitor who is in the tree sees it around themselves; anyone else sees the whole family. */
  isFocusMe: boolean
  /** The person whose sheet is open over the tree: the tree turns to them, so closing the sheet lands on their page. */
  shownPersonId: EntityId | null
}): TreeViewControls => {
  const [view, setView] = useState<TreeView>({
    depth: DEFAULT_TREE_DEPTH,
    focusId: initialFocusId,
    scope: isFocusMe ? 'around' : 'whole'
  })
  const [followedPersonId, setFollowedPersonId] = useState(shownPersonId)

  if (shownPersonId !== followedPersonId) {
    setFollowedPersonId(shownPersonId)
    if (shownPersonId !== null) {
      setView((current) => ({ ...current, focusId: shownPersonId }))
    }
  }

  const changeView = (change: Partial<TreeView>) => {
    startTransition(() => {
      setView((current) => ({ ...current, ...change }))
    })
  }

  return {
    setDepth: (depth) => changeView({ depth }),
    setFocus: (focusId) => changeView({ focusId }),
    setScope: (scope) => changeView({ scope }),
    showAround: (focusId) => changeView({ focusId, scope: 'around' }),
    view
  }
}
