import type { Result } from '@adrienlcp/result'
import { useState, useTransition } from 'react'

import type { Author } from '@arbor/protocol/change-log'
import {
  HISTORY_REFUSALS,
  type HistoryRefusal
} from '@arbor/protocol/history-refusal'
import type { RecordedOperations } from '@arbor/protocol/routes'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import {
  type ApiFailure,
  restoreFamily,
  undoEntries
} from '@/infrastructure/api/family-api'
import { useRefreshRouteData } from '@/infrastructure/router/navigation'

/** Why entries were not taken back, as the dialog tells it. */
export type UndoFailure =
  | HistoryRefusal
  | 'forbidden'
  | 'not_sent'
  | 'revision_conflict'

const isExplained = (
  error: ApiFailure
): error is Exclude<UndoFailure, 'not_sent'> =>
  error === 'forbidden' ||
  error === 'revision_conflict' ||
  HISTORY_REFUSALS.some((refusal) => refusal === error)

const failureOf = (error: ApiFailure): UndoFailure =>
  isExplained(error) ? error : 'not_sent'

/**
 * Takes entries back, or the whole family back to a past revision for the
 * keeper, signed with who the visitor said they are. The family reloads after
 * it, and the history with it; a refusal reloads them too, so the dialog
 * explains against what is now on screen.
 */
export const useUndo = () => {
  const { familyId, key } = useOpenFamily()
  const refreshFamily = useRefreshRouteData()
  const [isPending, startTransition] = useTransition()
  const [failure, setFailure] = useState<UndoFailure | null>(null)
  const me = rememberedMe(familyId)
  const author = me === null || me === ONLOOKER ? null : me

  const send = (
    write: (
      signedBy: Author
    ) => Promise<Result<RecordedOperations, ApiFailure>>,
    onDone: () => void
  ) => {
    if (author === null) return
    setFailure(null)
    startTransition(async () => {
      const written = await write(author)
      if (written.status === 'failure' && written.error === 'aborted') return
      await refreshFamily()
      startTransition(() => {
        if (written.status === 'success') {
          onDone()
          return
        }
        setFailure(failureOf(written.error))
      })
    })
  }

  const undo = (revisions: readonly number[], onDone: () => void) => {
    if (revisions.length === 0) return
    send(
      (signedBy) =>
        undoEntries({
          familyId,
          input: { author: signedBy, revisions: [...revisions] },
          key
        }),
      onDone
    )
  }

  /** `baseRevision` is the last revision the preview was made from: anything newer is a conflict. */
  const restore = (
    { baseRevision, revision }: { baseRevision: number; revision: number },
    onDone: () => void
  ) =>
    send(
      (signedBy) =>
        restoreFamily({
          familyId,
          input: { author: signedBy, baseRevision, revision },
          key
        }),
      onDone
    )

  return {
    /** Who signs the undo; `null` until the visitor says who they are. */
    author,
    dismissFailure: () => setFailure(null),
    failure,
    isPending,
    restore,
    undo
  }
}

export type Undo = ReturnType<typeof useUndo>
