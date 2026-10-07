import type { Result } from '@adrienlcp/result'
import {
  readStoredJson,
  type StorageReadError,
  type StorageWriteError,
  writeStoredJson
} from '@adrienlcp/safe-storage'
import { z } from 'zod'

import { familyIdSchema } from '@arbor/protocol/access'

import { familyAccessSchema } from './family-access'

const FAMILIES_STORAGE_KEY = 'arbor:families'

const storedFamiliesSchema = z.record(familyIdSchema, familyAccessSchema)
export type StoredFamilies = z.infer<typeof storedFamiliesSchema>

const isStoredFamilies = (value: unknown): value is StoredFamilies =>
  storedFamiliesSchema.safeParse(value).success

/** Every family this device has opened, `null` before the first one. */
export const readStoredFamilies = (): Result<
  StoredFamilies | null,
  StorageReadError
> => readStoredJson({ isValue: isStoredFamilies, key: FAMILIES_STORAGE_KEY })

export const writeStoredFamilies = (
  families: StoredFamilies
): Result<void, StorageWriteError> =>
  writeStoredJson({ key: FAMILIES_STORAGE_KEY, value: families })
