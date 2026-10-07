import type { KeyId, KeyView } from '@arbor/protocol/access'

import type { KeyCheckWindow } from './key-check-limit'
import type { KeyDigest } from './key-digest'

/** A key as the family keeps it: its digest, never the key. */
export type StoredKey = KeyView & { digest: KeyDigest }

/** The family's keys and its count of wrong ones. Synchronous: the object's SQLite storage is. */
export type AccessStore = {
  insertKey: (key: StoredKey) => void
  readKeyCheckWindow: () => KeyCheckWindow | null
  readKeys: () => StoredKey[]
  revokeKeys: (revocation: { at: string; ids: readonly KeyId[] }) => void
  writeKeyCheckWindow: (window: KeyCheckWindow) => void
}
