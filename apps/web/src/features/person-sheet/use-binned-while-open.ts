import { useEffect, useRef, useState } from 'react'

import type { Author } from '@arbor/protocol/change-log'
import type { EntityId } from '@arbor/protocol/entity-id'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { readChangeLog } from '@/infrastructure/api/family-api'

import { whoBinned } from './who-binned'

type BinnedWhileOpen = { binnedBy: Author | null; personId: EntityId }

/**
 * Who put the person in the bin while their sheet was open. The family only
 * reloads after the visitor's own saves, so a sheet that empties under their
 * eyes means one of those saves was refused because of it.
 */
export const useBinnedWhileOpen = ({
  isShown,
  personId
}: {
  isShown: boolean
  personId: EntityId | null
}): BinnedWhileOpen | null => {
  const { family: response, familyId, key } = useOpenFamily()
  const shownAt = useRef<{ personId: EntityId; revision: number } | null>(null)
  const [binned, setBinned] = useState<BinnedWhileOpen | null>(null)

  useEffect(() => {
    if (personId === null) return
    if (isShown) {
      shownAt.current = { personId, revision: response.revision }
      return
    }
    const shown = shownAt.current
    if (shown?.personId !== personId) return
    const controller = new AbortController()
    void readChangeLog({
      after: shown.revision,
      familyId,
      key,
      signal: controller.signal
    }).then((log) => {
      if (controller.signal.aborted) return
      setBinned({
        binnedBy:
          log.status === 'success'
            ? whoBinned(log.data.entries, personId)
            : null,
        personId
      })
    })
    return () => controller.abort()
  }, [familyId, isShown, key, personId, response.revision])

  return binned?.personId === personId ? binned : null
}
