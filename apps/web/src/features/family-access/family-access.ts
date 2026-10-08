import { z } from 'zod'

import {
  type AccessKey,
  accessKeySchema,
  type FamilyId,
  ROLES,
  type Role
} from '@arbor/protocol/access'
import { authorSchema } from '@arbor/protocol/change-log'
import { DEMO_FAMILY_ID, DEMO_FAMILY_KEY } from '@arbor/protocol/demo-family'

/** Someone who opened the tree only to look, and said so on "Who are you?". */
export const ONLOOKER = 'onlooker'

/**
 * What this device remembers of one family. Keys are kept per role, so a
 * keeper who taps the shared family link keeps the keeper key beside it.
 */
export const familyAccessSchema = z.object({
  keys: z.partialRecord(z.enum(ROLES), accessKeySchema),
  /** Who this device's visitor said they are; `null` until they answer. */
  me: z.union([authorSchema, z.literal(ONLOOKER)]).nullable(),
  /** The family's name the last time it opened, for the list of trees on the landing page. */
  name: z.string().nullable(),
  /** A key just received in a link, until the family accepts or refuses it. */
  unverifiedKey: accessKeySchema.nullable()
})
export type FamilyAccess = z.infer<typeof familyAccessSchema>

export const NO_FAMILY_ACCESS: FamilyAccess = {
  keys: {},
  me: null,
  name: null,
  unverifiedKey: null
}

/** The most a key can do first, so a keeper opening the family link is still recognised as keeper. */
const ROLES_BY_REACH: readonly Role[] = ROLES.toReversed()

/** The keys to present, in order: the one just received, then the known ones from the most powerful down. */
export const keysToTry = (access: FamilyAccess): AccessKey[] => {
  const knownKeys = ROLES_BY_REACH.map((role) => access.keys[role]).filter(
    (key): key is AccessKey => key !== undefined
  )
  const candidates =
    access.unverifiedKey === null
      ? knownKeys
      : [access.unverifiedKey, ...knownKeys]

  return [...new Set(candidates)]
}

/** The keys to present to one family: the demo's public key is always among them, so its address alone opens it. */
export const keysToTryFor = (
  familyId: FamilyId,
  access: FamilyAccess
): AccessKey[] =>
  keysToTry(
    familyId === DEMO_FAMILY_ID
      ? withReceivedKey(access, DEMO_FAMILY_KEY)
      : access
  )

/** The most this device can do in the family, `null` while it holds no key the family accepted. */
export const strongestRole = (access: FamilyAccess): Role | null =>
  ROLES_BY_REACH.find((role) => access.keys[role] !== undefined) ?? null

/** A link just opened: its key is tried first, unless the device already holds it. */
export const withReceivedKey = (
  access: FamilyAccess,
  key: AccessKey
): FamilyAccess =>
  Object.values(access.keys).includes(key)
    ? access
    : { ...access, unverifiedKey: key }

/** The family let `key` in as `role`: it becomes that role's key. */
export const afterAccepted = (
  access: FamilyAccess,
  { key, role }: { key: AccessKey; role: Role }
): FamilyAccess => ({
  ...access,
  keys: { ...access.keys, [role]: key },
  unverifiedKey: access.unverifiedKey === key ? null : access.unverifiedKey
})

/** The family no longer knows `key` — replaced or revoked: the device forgets it. */
export const afterRefused = (
  access: FamilyAccess,
  key: AccessKey
): FamilyAccess => ({
  ...access,
  keys: Object.fromEntries(
    Object.entries(access.keys).filter(([, held]) => held !== key)
  ),
  unverifiedKey: access.unverifiedKey === key ? null : access.unverifiedKey
})
