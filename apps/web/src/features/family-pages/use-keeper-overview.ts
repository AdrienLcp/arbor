import { useEffect, useState } from 'react'

import type { AccessKey, FamilyId, KeyView } from '@arbor/protocol/access'
import type { StorageUsage } from '@arbor/protocol/routes'

import { listKeys, readUsage } from '@/infrastructure/api/family-api'

/** What only the keeper sees: the links handed out, and the room the family takes. */
export type KeeperOverview = {
  keys: KeyView[]
  usage: StorageUsage
}

type OverviewState = KeeperOverview | 'failed' | 'loading'

/** Loads the keeper's overview once; the caller remounts the reader of it to load it again after a change. */
export const useKeeperOverview = ({
  familyId,
  key
}: {
  familyId: FamilyId
  key: AccessKey
}): OverviewState => {
  const [overview, setOverview] = useState<OverviewState>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const load = async (): Promise<void> => {
      const [keys, usage] = await Promise.all([
        listKeys({ familyId, key, signal }),
        readUsage({ familyId, key, signal })
      ])

      if (signal.aborted) {
        return
      }

      setOverview(
        keys.status === 'success' && usage.status === 'success'
          ? { keys: keys.data, usage: usage.data }
          : 'failed'
      )
    }

    void load()
    return () => controller.abort()
  }, [familyId, key])

  return overview
}
