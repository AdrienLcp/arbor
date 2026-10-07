import type { Hono } from 'hono'

import type { FamilySettings } from '@arbor/protocol/family'

import type { Admission } from '@/domain/access/access-service'
import type { AccessStore } from '@/domain/access/access-store'
import type { FamilyStore } from '@/domain/family/family-store'
import type { Viewer } from '@/domain/family/family-view'
import type { PhotoStore } from '@/domain/photos/photo-store'
import { now } from '@/infrastructure/clock'
import { utcDayOf } from '@/infrastructure/dates'

/** Everything one family's object keeps, and the transaction that writes to several of them at once. */
export type RoomStores = {
  access: AccessStore
  /** The bytes the object's storage holds: the tree, its log and its photos alike. */
  databaseSize: () => number
  family: FamilyStore
  photos: PhotoStore
  transaction: <T>(run: () => T) => T
}

/** What a request to a family carries once the object has admitted its key. */
export type RoomVariables = {
  admission: Admission
  stores: RoomStores
}

/** The API one family's object answers. */
export type RoomApp = Hono<{ Variables: RoomVariables }>

/** The settings of the family a key was admitted to, which it has from its creation on. */
export const admittedSettingsOf = (stores: RoomStores): FamilySettings => {
  const settings = stores.family.readSettings()
  if (settings === null) {
    throw new Error('An admitted request reached a family with no settings')
  }
  return settings
}

/** The family as it stands, seen by the role of the key that asked. */
export const viewerOf = ({ admission, stores }: RoomVariables): Viewer => ({
  role: admission.role,
  settings: admittedSettingsOf(stores),
  today: utcDayOf(now())
})
