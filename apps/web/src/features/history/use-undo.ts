import type { Result } from '@adrienlcp/result'
import { useState, useTransition } from 'react'

import type { Author } from '@arbor/protocol/change-log'
import {
  HISTORY_REFUSALS,
  type HistoryRefusal
} from '@arbor/protocol/history-refusal'
import type { RecordedOperations } from '@arbor/protocol/routes'

import { rememberedAuthor } from '@/features/family-access/remembered-families'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import { useWhoAmI } from '@/features/family-pages/who-am-i-provider'
import {
  type ApiFailure,
  restoreFamily,
  undoEntries
} from '@/infrastructure/api/family-api'
import { useRefreshRouteData } from '@/infrastructure/router/navigation'

/** Why entries were not taken back, as the dialog tells it. */
export type UndoFailure =
  | HistoryRefusal
  | 'demo_write_limit'
  | 'forbidden'
  | 'not_sent'
  | 'revision_conflict'

const isExplained = (
  error: ApiFailure
): error is Exclude<UndoFailure, 'not_sent'> =>
  error === 'demo_write_limit' ||
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
  const { signFirst } = useWhoAmI()

  const send = (
    write: (
      signedBy: Author
    ) => Promise<Result<RecordedOperations, ApiFailure>>,
    onDone: () => void
  ) => {
    const signer = rememberedAuthor(familyId)
    if (signer === null) return
    setFailure(null)
    startTransition(async () => {
      const written = await write(signer)
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
    dismissFailure: () => setFailure(null),
    failure,
    isPending,
    restore,
    /** Opens an undo or a restore: at once for a visitor who said who they are, after "Who are you?" for anyone else. */
    signFirst,
    undo
  }
}

export type Undo = ReturnType<typeof useUndo>
