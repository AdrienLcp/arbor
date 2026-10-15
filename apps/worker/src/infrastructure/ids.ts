import {
  ACCESS_KEY_LENGTH,
  type AccessKey,
  FAMILY_ID_LENGTH,
  type FamilyId,
  type KeyId
} from '@arbor/protocol/access'
import { randomId } from '@arbor/protocol/random-id'

const KEY_ID_LENGTH = 10

export const newFamilyId = (): FamilyId => randomId(FAMILY_ID_LENGTH)

export const newAccessKey = (): AccessKey => randomId(ACCESS_KEY_LENGTH)

export const newKeyId = (): KeyId => randomId(KEY_ID_LENGTH)
