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
  isFocusMe
}: {
  initialFocusId: EntityId
  /** On arrival, a visitor who is in the tree sees it around themselves; anyone else sees the whole family. */
  isFocusMe: boolean
}): TreeViewControls => {
  const [view, setView] = useState<TreeView>({
    depth: DEFAULT_TREE_DEPTH,
    focusId: initialFocusId,
    scope: isFocusMe ? 'around' : 'whole'
  })

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
