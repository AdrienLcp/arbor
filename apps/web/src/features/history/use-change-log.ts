import { useEffect, useState } from 'react'

import type { ChangeLogEntry } from '@arbor/protocol/change-log'

import { useOpenFamily } from '@/features/family-pages/family-loader'
import { readChangeLog } from '@/infrastructure/api/family-api'

/** The family's whole change log, oldest first, as far as it has arrived. */
export type ChangeLog =
  | { status: 'failed' }
  | { status: 'loading' }
  | { entries: ChangeLogEntry[]; status: 'loaded' }

/**
 * Reads the whole log, one page after the other, then only what is new each
 * time the family reloads after a change: an undo shows up without asking,
 * and the log is never read twice. A reader's link cannot read it: pass
 * `isWanted: false` for one.
 */
export const useChangeLog = ({
  isWanted = true
}: {
  isWanted?: boolean
} = {}): { log: ChangeLog; retry: () => void } => {
  const { family: response, familyId, key } = useOpenFamily()
  const [log, setLog] = useState<ChangeLog>({ status: 'loading' })

  useEffect(() => {
    if (!isWanted || log.status === 'failed') return
    const held = log.status === 'loaded' ? log.entries : []
    const heldUpTo = held.at(-1)?.revision ?? 0
    if (log.status === 'loaded' && heldUpTo >= response.revision) return
    const controller = new AbortController()
    const readSince = async (): Promise<ChangeLog> => {
      const entries = [...held]
      let after: number | null = heldUpTo
      while (after !== null) {
        const page = await readChangeLog({
          after,
          familyId,
          key,
          signal: controller.signal
        })
        if (page.status === 'failure') return { status: 'failed' }
        entries.push(...page.data.entries)
        after = page.data.nextAfter
      }
      return { entries, status: 'loaded' }
    }
    void readSince().then((read) => {
      if (!controller.signal.aborted) setLog(read)
    })
    return () => controller.abort()
  }, [familyId, isWanted, key, log, response.revision])

  return { log, retry: () => setLog({ status: 'loading' }) }
}
