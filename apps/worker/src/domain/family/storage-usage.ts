import type { StorageUsage } from '@arbor/protocol/routes'

/**
 * The share of the account's 5 GB of free Durable Object storage one family
 * may fill: about 4,000 photos at the size the browser resizes them to.
 */
export const FAMILY_STORAGE_LIMIT_BYTES = 1_000_000_000

/** A family's usage against its share of the free storage. */
export const storageUsageOf = (usedBytes: number): StorageUsage => ({
  limitBytes: FAMILY_STORAGE_LIMIT_BYTES,
  usedBytes
})
