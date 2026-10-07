/** The SHA-256 of an access key, in hex: what the family stores instead of the key. */
export type KeyDigest = string

/**
 * Compares two digests in a time that does not depend on where they differ,
 * so response times reveal nothing about a stored digest.
 */
export const isSameDigest = (
  presented: KeyDigest,
  stored: KeyDigest
): boolean => {
  if (presented.length !== stored.length) return false
  let difference = 0
  for (let index = 0; index < presented.length; index++) {
    difference |= presented.charCodeAt(index) ^ stored.charCodeAt(index)
  }
  return difference === 0
}
