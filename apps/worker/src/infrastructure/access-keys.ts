import type { AccessKey } from '@arbor/protocol/access'

import type { MintedKey } from '@/domain/access/access-service'
import type { KeyDigest } from '@/domain/access/key-digest'

import { newAccessKey, newKeyId } from './ids'

export const digestOf = async (key: AccessKey): Promise<KeyDigest> => {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(key)
  )
  return new Uint8Array(hash).toHex()
}

export const mintKey = async (): Promise<MintedKey> => {
  const key = newAccessKey()
  return { digest: await digestOf(key), id: newKeyId(), key }
}
