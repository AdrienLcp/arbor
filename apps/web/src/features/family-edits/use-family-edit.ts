import type { Result } from '@adrienlcp/result'
import { useState, useTransition } from 'react'

import type { Author } from '@arbor/protocol/change-log'
import type { Operation } from '@arbor/protocol/operation'
import {
  OPERATION_REFUSALS,
  type OperationRefusal
} from '@arbor/protocol/operation-refusal'

import { ONLOOKER } from '@/features/family-access/family-access'
import { rememberedMe } from '@/features/family-access/remembered-families'
import { useOpenFamily } from '@/features/family-pages/family-loader'
import {
  type ApiFailure,
  readChangeLog,
  recordOperations
} from '@/infrastructure/api/family-api'
import { useRefreshRouteData } from '@/infrastructure/router/navigation'

/** Why a save did not go through, as the form tells it. */
export type EditFailure =
  /** Someone changed the family meanwhile: it was reloaded, and these people's changes are now on screen. */
  | { authors: readonly Author[]; kind: 'family_moved' }
  /** The family refuses the change itself: someone cannot be their own ancestor. */
  | { kind: 'refused'; refusal: OperationRefusal }
  /** The change never arrived: no network, or the server failed. */
  | { kind: 'not_sent' }

/** What a save does once its changes are in the log, before the family reloads: a photo's images go up then. */
export type AfterRecording = (
  revision: number
) => Promise<Result<void, ApiFailure>>

const isRefusal = (failure: ApiFailure): failure is OperationRefusal =>
  OPERATION_REFUSALS.some((refusal) => refusal === failure)

/** Everyone who signed a change, each once, in the order they wrote. */
const distinctAuthors = (authors: readonly Author[]): Author[] => [
  ...new Map(
    authors.map((author) => [
      author.kind === 'person' ? author.personId : `named:${author.name}`,
      author
    ])
  ).values()
]

/**
 * Saves changes to the open family, signed with who the visitor said they
 * are. Each save is one batch against the revision on screen: the family
 * reloads after it, and a save overtaken by someone else's says who.
 */
export const useFamilyEdit = () => {
  const { family: response, familyId, key } = useOpenFamily()
  const refreshFamily = useRefreshRouteData()
  const [isPending, startTransition] = useTransition()
  const [failure, setFailure] = useState<EditFailure | null>(null)
  const me = rememberedMe(familyId)
  const author = me === null || me === ONLOOKER ? null : me

  const authorsSince = async (revision: number): Promise<Author[]> => {
    const log = await readChangeLog({ after: revision, familyId, key })
    return log.status === 'success'
      ? distinctAuthors(log.data.entries.map((entry) => entry.author))
      : []
  }

  const failWith = (error: ApiFailure) =>
    startTransition(() =>
      setFailure(
        isRefusal(error)
          ? { kind: 'refused', refusal: error }
          : { kind: 'not_sent' }
      )
    )

  const save = (
    operations: readonly Operation[],
    onSaved: () => void,
    afterRecording?: AfterRecording
  ) => {
    if (author === null || operations.length === 0) return
    const baseRevision = response.revision
    setFailure(null)
    startTransition(async () => {
      const recorded = await recordOperations({
        familyId,
        input: { author, baseRevision, operations: [...operations] },
        key
      })
      if (recorded.status === 'success') {
        const followed = await afterRecording?.(recorded.data.revision)
        await refreshFamily()
        if (followed?.status === 'failure') {
          failWith(followed.error)
          return
        }
        startTransition(onSaved)
        return
      }
      if (recorded.error === 'aborted') return
      if (recorded.error === 'revision_conflict') {
        const authors = await authorsSince(baseRevision)
        await refreshFamily()
        startTransition(() => setFailure({ authors, kind: 'family_moved' }))
        return
      }
      failWith(recorded.error)
    })
  }

  return {
    /** Who signs the changes; `null` until the visitor says who they are. */
    author,
    /** A reader's link shows the tree without changing it. */
    canEdit: response.role !== 'reader',
    /** Clears the last failure, when the form it belonged to closes. */
    dismissFailure: () => setFailure(null),
    failure,
    isPending,
    save
  }
}

/** The open family's save, its signature and its last failure. */
export type FamilyEdit = ReturnType<typeof useFamilyEdit>
