import type { FamilyId } from '@arbor/protocol/access'

import { warnOnFailure } from '@/infrastructure/diagnostics'

import { type FamilyAccess, NO_FAMILY_ACCESS } from './family-access'
import {
  readStoredFamilies,
  type StoredFamilies,
  writeStoredFamilies
} from './family-access-storage'

/**
 * What this tab knows, ahead of storage: in a private window where storage
 * refuses every write, the link just opened still works until the tab closes.
 */
let familiesInThisTab: StoredFamilies | null = null

const rememberedFamilies = (): StoredFamilies => {
  if (familiesInThisTab !== null) {
    return familiesInThisTab
  }

  const stored = readStoredFamilies()

  if (stored.status === 'failure') {
    warnOnFailure(stored, 'Reading the families this device opened')
    return {}
  }

  return stored.data ?? {}
}

/** What the device remembers of one family, nothing at all for a family it never opened. */
export const rememberedFamily = (familyId: FamilyId): FamilyAccess =>
  rememberedFamilies()[familyId] ?? NO_FAMILY_ACCESS

/** The families this device opened, for "Your trees" on the landing page. */
export const rememberedFamilyList = (): {
  access: FamilyAccess
  familyId: FamilyId
}[] =>
  Object.entries(rememberedFamilies()).map(([familyId, access]) => ({
    access,
    familyId
  }))

/** Changes what the device remembers of one family; kept for this tab even when storage refuses it. */
export const rememberFamily = (
  familyId: FamilyId,
  change: (access: FamilyAccess) => FamilyAccess
): void => {
  const families = rememberedFamilies()
  familiesInThisTab = {
    ...families,
    [familyId]: change(families[familyId] ?? NO_FAMILY_ACCESS)
  }
  warnOnFailure(
    writeStoredFamilies(familiesInThisTab),
    'Remembering the family on this device'
  )
}
