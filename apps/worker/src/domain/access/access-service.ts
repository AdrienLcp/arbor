import { Result } from '@adrienlcp/result'

import type {
  AccessKey,
  IssuedKey,
  KeyId,
  KeyView,
  Role
} from '@arbor/protocol/access'

import type { AccessStore, StoredKey } from './access-store'
import { isLockedOut, withFailedCheck } from './key-check-limit'
import { isSameDigest, type KeyDigest } from './key-digest'

/** A key drawn at the edge, where randomness and hashing live, with what the family stores of it. */
export type MintedKey = { digest: KeyDigest; id: KeyId; key: AccessKey }

/** Who is knocking: the role of the key they hold. */
export type Admission = { keyId: KeyId; role: Role }

export type AdmissionRefusal = 'too_many_attempts' | 'unauthorized'

const isActive = (key: StoredKey) => key.revokedAt === null

/** The stored key whose digest matches, found by checking every key so the time taken says nothing about which. */
const keyWithDigest = (
  keys: readonly StoredKey[],
  digest: KeyDigest
): StoredKey | null => {
  let found: StoredKey | null = null
  for (const key of keys) {
    if (isSameDigest(digest, key.digest)) found = key
  }
  return found
}

/**
 * Lets in the holder of a live key. A key the family never issued counts
 * against its limit; a revoked one is refused without counting, since its
 * holder is not guessing.
 */
export const admit = ({
  digest,
  now,
  store
}: {
  digest: KeyDigest
  now: Temporal.Instant
  store: AccessStore
}): Result<Admission, AdmissionRefusal> => {
  const window = store.readKeyCheckWindow()
  if (isLockedOut(window, now)) return Result.failure('too_many_attempts')

  const key = keyWithDigest(store.readKeys(), digest)
  if (key === null) {
    store.writeKeyCheckWindow(withFailedCheck(window, now))
    return Result.failure('unauthorized')
  }
  if (!isActive(key)) return Result.failure('unauthorized')

  return Result.success({ keyId: key.id, role: key.role })
}

/** Stores a new key for `role` and hands its secret back, once. */
export const issueKey = ({
  at,
  minted,
  role,
  store
}: {
  at: string
  minted: MintedKey
  role: Role
  store: AccessStore
}): IssuedKey => {
  store.insertKey({
    createdAt: at,
    digest: minted.digest,
    id: minted.id,
    revokedAt: null,
    role
  })
  return { id: minted.id, key: minted.key, role }
}

/** Revokes every family link in circulation and issues the one that replaces them: a leaked link is a one-tap fix. */
export const replaceFamilyKey = ({
  at,
  minted,
  store
}: {
  at: string
  minted: MintedKey
  store: AccessStore
}): IssuedKey => {
  const circulating = store
    .readKeys()
    .filter((key) => isActive(key) && key.role === 'contributor')
    .map((key) => key.id)
  store.revokeKeys({ at, ids: circulating })
  return issueKey({ at, minted, role: 'contributor', store })
}

/** Revokes one key, unless it is the last way left to manage the family. */
export const revokeKey = ({
  at,
  keyId,
  store
}: {
  at: string
  keyId: KeyId
  store: AccessStore
}): Result<void, 'last_keeper_key' | 'not_found'> => {
  const keys = store.readKeys().filter(isActive)
  const key = keys.find((candidate) => candidate.id === keyId)
  if (key === undefined) return Result.failure('not_found')

  const isLastKeeperKey =
    key.role === 'keeper' &&
    keys.filter((candidate) => candidate.role === 'keeper').length === 1
  if (isLastKeeperKey) return Result.failure('last_keeper_key')

  store.revokeKeys({ at, ids: [keyId] })
  return Result.success()
}

/** Every key the family ever issued, revoked ones included, without their digests. */
export const listKeys = (store: AccessStore): KeyView[] =>
  store.readKeys().map(({ createdAt, id, revokedAt, role }) => ({
    createdAt,
    id,
    revokedAt,
    role
  }))
