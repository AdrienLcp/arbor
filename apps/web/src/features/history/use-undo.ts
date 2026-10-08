import { useState, useTransition } from 'react'

import {
  HISTORY_REFUSALS,
  type HistoryRefusal
} from '@arbor/protocol/history-refusal'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { type ApiFailure, undoEntries } from '@/infrastructure/api/family-api'
import { useRefreshRouteData } from '@/infrastructure/router/navigation'

/** Why entries were not taken back, as the dialog tells it. */
export type UndoFailure = HistoryRefusal | 'forbidden' | 'not_sent'

const isExplained = (
  error: ApiFailure
): error is HistoryRefusal | 'forbidden' =>
  error === 'forbidden' || HISTORY_REFUSALS.some((refusal) => refusal === error)

const failureOf = (error: ApiFailure): UndoFailure =>
  isExplained(error) ? error : 'not_sent'

/**
 * Takes entries back, signed with who the visitor said they are. The family
 * reloads after it, and the history with it; a refusal reloads them too, so
 * the dialog explains against what is now on screen.
 */
export const useUndo = () => {
  const { familyId, key } = useOpenFamily()
  const refreshFamily = useRefreshRouteData()
  const [isPending, startTransition] = useTransition()
  const [failure, setFailure] = useState<UndoFailure | null>(null)
  const me = rememberedMe(familyId)
  const author = me === null || me === ONLOOKER ? null : me

  const undo = (revisions: readonly number[], onDone: () => void) => {
    if (author === null || revisions.length === 0) return
    setFailure(null)
    startTransition(async () => {
      const undone = await undoEntries({
        familyId,
        input: { author, revisions: [...revisions] },
        key
      })
      if (undone.status === 'failure' && undone.error === 'aborted') return
      await refreshFamily()
      startTransition(() => {
        if (undone.status === 'success') {
          onDone()
          return
        }
        setFailure(failureOf(undone.error))
      })
    })
  }

  return {
    /** Who signs the undo; `null` until the visitor says who they are. */
    author,
    dismissFailure: () => setFailure(null),
    failure,
    isPending,
    undo
  }
}

export type Undo = ReturnType<typeof useUndo>
