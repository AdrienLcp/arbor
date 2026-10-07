import { nanoid } from 'nanoid'

import {
  type AccessKey,
  type FamilyId,
  type KeyId,
  SECRET_LENGTH
} from '@arbor/protocol/access'

const KEY_ID_LENGTH = 10

export const newFamilyId = (): FamilyId => nanoid(SECRET_LENGTH)

export const newAccessKey = (): AccessKey => nanoid(SECRET_LENGTH)

export const newKeyId = (): KeyId => nanoid(KEY_ID_LENGTH)
