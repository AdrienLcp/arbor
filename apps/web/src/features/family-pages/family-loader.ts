import type { AccessKey, FamilyId } from '@arbor/protocol/access'
import type { FamilyResponse } from '@arbor/protocol/family'

import {
  afterAccepted,
  afterRefused,
  keysToTry
} from '@/features/family-access/family-access'
import {
  rememberedFamily,
  rememberFamily
} from '@/features/family-access/remembered-families'
import { fetchFamily } from '@/infrastructure/api/family-api'
import { ROUTE_IDS, useLayoutData } from '@/infrastructure/router/navigation'

/** A family this device was let into, with the key that opened it. */
export type OpenFamily = {
  family: FamilyResponse
  familyId: FamilyId
  key: AccessKey
}

/**
 * What opening a family gave: the family; no key it still accepts — replaced,
 * revoked, never received; or no answer at all.
 */
export type FamilyRouteData =
  | ({ status: 'open' } & OpenFamily)
  | { status: 'refused' }
  | { status: 'unreachable' }

const opened = (
  familyId: FamilyId,
  { family, key }: { family: FamilyResponse; key: AccessKey }
): FamilyRouteData => {
  rememberFamily(familyId, (access) => ({
    ...afterAccepted(access, { key, role: family.role }),
    name: family.settings.name
  }))

  return { family, familyId, key, status: 'open' }
}

/** Presents the device's keys one by one, forgetting each the family no longer knows. */
export const familyLoader = async ({
  familyId,
  signal
}: {
  familyId: FamilyId | null
  signal: AbortSignal
}): Promise<FamilyRouteData> => {
  if (familyId === null) {
    return { status: 'refused' }
  }

  for (const key of keysToTry(rememberedFamily(familyId))) {
    const family = await fetchFamily({ familyId, key, signal })

    if (family.status === 'success') {
      return opened(familyId, { family: family.data, key })
    }

    const isKeyRefused =
      family.error === 'unauthorized' || family.error === 'not_found'

    if (!isKeyRefused) {
      return { status: 'unreachable' }
    }

    rememberFamily(familyId, (access) => afterRefused(access, key))
  }

  return { status: 'refused' }
}

export const useFamilyRouteData = (): FamilyRouteData =>
  useLayoutData<typeof familyLoader>(ROUTE_IDS.family)

/** The family a page below the family layout shows: the layout renders its pages only once the family opened. */
export const useOpenFamily = (): OpenFamily => {
  const family = useFamilyRouteData()

  if (family.status !== 'open') {
    throw new Error('A family page rendered before its family opened')
  }

  return family
}
