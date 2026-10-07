import { startTransition, useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import type { FamilyState } from '@arbor/core/family/family-state'

import { type TreeScene, treeScene } from './tree-scene'
import {
  DEFAULT_TREE_DEPTH,
  layoutOfView,
  type TreeScope,
  type TreeView
} from './tree-view'

export type TreeViewControls = {
  scene: TreeScene
  /** Turns the tree around another person, as a transition: the stickers slide to their new places. */
  setFocus: (focusId: EntityId) => void
  setDepth: (depth: number) => void
  setScope: (scope: TreeScope) => void
  view: TreeView
}

/** The view the canvas shows, and the scene it draws from it. */
export const useTreeView = ({
  family,
  initialFocusId,
  isFocusMe
}: {
  family: FamilyState
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
    scene: treeScene({
      layout: layoutOfView(family, view),
      persons: family.persons
    }),
    setDepth: (depth) => changeView({ depth }),
    setFocus: (focusId) => changeView({ focusId }),
    setScope: (scope) => changeView({ scope }),
    view
  }
}
