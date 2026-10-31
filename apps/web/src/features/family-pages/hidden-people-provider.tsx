import { createSafeContext } from '@adrienlcp/react'
import type React from 'react'
import { useState } from 'react'

import type { EntityId } from '@arbor/protocol/entity-id'

import { familyStateOfSnapshot } from '@arbor/core/family/family-state-of-snapshot'
import { childrenLosingAParent } from '@arbor/core/family/without-people'
import {
  type HiddenPeople,
  hiddenPeople,
  type ShownChange,
  toggleShown
} from '@arbor/core/relatives/hidden-people'
import { familyLineage } from '@arbor/core/tree-layout/family-lineage'

import {
  rememberedHiddenIds,
  rememberHiddenIds
} from '@/features/family-access/remembered-families'

import { useOpenFamily } from './family-loader'

/** The last thing a tick did, read out while choosing; `everyone` after "Show everyone". */
export type LastChange = ShownChange | { kind: 'everyone' } | null

type HiddenPeopleState = {
  hidden: HiddenPeople
  /** Children whose other parent is hidden: the empty slot beside them stands for someone hidden, not someone unknown. */
  hiddenParentChildIds: ReadonlySet<EntityId>
  /** In "Choose who to show": a press ticks or unticks instead of opening a sheet, and nothing moves until it ends. */
  isChoosing: boolean
  lastChange: LastChange
  showEveryone: () => void
  startChoosing: () => void
  stopChoosing: () => void
  toggle: (personId: EntityId) => void
}

export const [HiddenPeopleContext, useHiddenPeople] =
  createSafeContext<HiddenPeopleState>('HiddenPeopleProvider')

type HiddenPeopleProviderProps = { children: React.ReactNode }

/** Who this device's visitor chose not to see in the open family: the tree, its list and its print leave them out. */
export const HiddenPeopleProvider: React.FC<HiddenPeopleProviderProps> = ({
  children
}) => {
  const { family: response, familyId } = useOpenFamily()
  const [uncheckedIds, setUncheckedIds] = useState(() =>
    rememberedHiddenIds(familyId)
  )
  const [isChoosing, setIsChoosing] = useState(false)
  const [lastChange, setLastChange] = useState<LastChange>(null)
  const family = familyStateOfSnapshot(response.family)
  const lineage = familyLineage(family)
  const hidden = hiddenPeople(lineage, uncheckedIds)

  const remember = (ids: readonly EntityId[], change: LastChange) => {
    rememberHiddenIds(familyId, ids)
    setUncheckedIds(ids)
    setLastChange(change)
  }

  const setChoosing = (value: boolean) => {
    setIsChoosing(value)
    setLastChange(null)
  }

  return (
    <HiddenPeopleContext
      value={{
        hidden,
        hiddenParentChildIds: childrenLosingAParent(family, hidden.hiddenIds),
        isChoosing,
        lastChange,
        showEveryone: () => remember([], { kind: 'everyone' }),
        startChoosing: () => setChoosing(true),
        stopChoosing: () => setChoosing(false),
        toggle: (personId) => {
          const { after, change } = toggleShown(lineage, hidden, personId)
          remember([...after.uncheckedIds], change)
        }
      }}
    >
      {children}
    </HiddenPeopleContext>
  )
}
