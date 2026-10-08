import type { AccessKey, FamilyId, Role } from '@arbor/protocol/access'
import type { EntityId } from '@arbor/protocol/entity-id'

import { warnOnFailure } from '@/infrastructure/diagnostics'

import {
  type FamilyAccess,
  NO_FAMILY_ACCESS,
  ONLOOKER,
  withReceivedKey
} from './family-access'
import {
  readStoredFamilies,
  type StoredFamilies,
  writeStoredFamilies
} from './family-access-storage'
import type { ReceivedLink } from './received-link'

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

/** A family link just opened or pasted: its key is tried first the next time the family opens. */
export const receiveFamilyLink = ({ familyId, key }: ReceivedLink): void => {
  rememberFamily(familyId, (access) => withReceivedKey(access, key))
}

/** Who this device's visitor said they are in the family, `null` until they answer "Who are you?". */
export const rememberedMe = (familyId: FamilyId): FamilyAccess['me'] =>
  rememberedFamily(familyId).me

/** The person this device's visitor said they are, `null` for an onlooker, a newcomer or someone not in the tree yet. */
export const rememberedMyPersonId = (familyId: FamilyId): EntityId | null => {
  const me = rememberedMe(familyId)
  return me !== null && me !== ONLOOKER && me.kind === 'person'
    ? me.personId
    : null
}

/** Remembers the visitor's answer to "Who are you?": it signs every change they make from this device. */
export const rememberMe = (
  familyId: FamilyId,
  me: FamilyAccess['me']
): void => {
  rememberFamily(familyId, (access) => ({ ...access, me }))
}

/** Keeps a key this device was just handed by the family — a new family link, a read-only link. */
export const rememberKey = (
  familyId: FamilyId,
  { key, role }: { key: AccessKey; role: Role }
): void => {
  rememberFamily(familyId, (access) => ({
    ...access,
    keys: { ...access.keys, [role]: key }
  }))
}

/** Forgets the key of one role — a read-only link the keeper just turned off. */
export const forgetKey = (familyId: FamilyId, role: Role): void => {
  rememberFamily(familyId, (access) => ({
    ...access,
    keys: Object.fromEntries(
      Object.entries(access.keys).filter(([held]) => held !== role)
    )
  }))
}
